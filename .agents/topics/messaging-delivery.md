# Messaging Delivery Semantics

Read before changing retry, ordering, redelivery, process-status locking, the analysis reconciler or bucket reply correlation.

Bus wiring, dispatchers, workers and component lifecycle are in [messaging](messaging.md).

## Messaging delivery semantics

Delivery is at-least-once (#1935, #1947).

**Retries.** A WORK message that fails or is redelivered is re-published with the next attempt in the `x-attempt` header (handlers read `metadata.delivery`), with backoff from 1s doubled per attempt, capped at 30s, for `MESSAGE_BUS_MAX_ATTEMPTS` (5) attempts, then dropped with an error log. No dead-letter queue, by decision. A retry goes to the queue tail, so a retried event can land after a later one.

**Redelivery guard is per process.** A channel reset redelivers a message whose handler still runs; amqp-extension holds such a copy until the original settles. A redelivery that lands on **another** replica (connection drop, `consumer_timeout`) runs a second time — no distributed claim exists. Operator contract: RabbitMQ's `consumer_timeout` must exceed the longest build (see [deployment configuration](../../docs/src/guide/deployment/configuration.md#message-delivery-rabbitmq)).

**`prefetchCount: 1` on every consumer, events included.** Aggregators read-modify-write, and typeorm's `save()` diffs against the database, so concurrent handling writes a stale status back. That serializes per replica only; across replicas see ordering and locking below.

**Ordered reply queues.** The six reply routings (worker analysis-builder / analysis-distributor / master-image-builder / master-image-synchronizer events, storage bucket / bucket-file events) are `ordered: true`, declared as `x-single-active-consumer` on **both** publish and consume — differing arguments answer 406. Ordering is load-bearing: competing consumers would let a stale `PROGRESS` overwrite `EXECUTED` on another replica. Rollout: workers and storage before server-core.

**Awaited child events.** `await context.handle(EVENT)` in a worker handler awaits the publish, so a command is acked only after its result event is out and a publish failure reaches the handler's `catch` and the retry.

**Failure classification (worker).** A handler rethrows (the bus retries) only when `isRetryableFailure(e, metadata)` (`apps/server-core-worker/src/app/components/helpers.ts`) holds: a transient error (hapic network error or 5xx/429, dockerode `statusCode >= 500`, socket codes, `ENOENT` only on `connect`) and `delivery.attempt < delivery.maxAttempts`. Otherwise it emits `*_FAILED`, so nothing is dropped silently. Without a delivery (in-process call) or on the memory driver (`1/1`) every attempt is the last. Errors inside a docker build/push stream (`errorDetail`) are permanent.

**Error payloads.** hubwire's `serializeMessage` keeps `name`/`message`/`code` of an `Error`; a failed master-image build emits `EXECUTION_FAILED`, not `EXECUTION_FINISHED`.

**`'*'` is a fallback, not a tap.** A specific handler shadows it, so the master-image synchronizer aggregator's `EXECUTION_FINISHED` handler records its telemetry event itself.

**The telemetry log queue never retries.** The log writer drops a line that fails validation or that the log store rejects (VictoriaLogs outage): a retry would hold the single prefetch slot through its backoff and pile every service's log lines up in the broker.

**Race-safe status transitions (#1937).** Every read-check-mutate-save of `buildStatus` / `distributionStatus` — analysis build/distribution start, configuration lock/unlock, master-image BUILD, the worker aggregators — runs through `updateLockedEntity` (`adapters/database/locked-update.ts`), reached from `core/` as `IAnalysisRepository` / `IMasterImageRepository` `.updateLocked(id, fn)`, on a row held by `SELECT … FOR UPDATE`. Of concurrent starts exactly one dispatches. Rules:

- `fn` is synchronous (nothing awaited under the lock) and returns `true` to save; dispatch only after it resolves.
- Never `repository.update()`: it bypasses the subscribers that publish realtime and audit events.
- Never `repository.merge()` inside `fn`: typeorm's mutates, the test fake's returns a copy.
- Every other writer of these rows must not `save()` a copy read earlier: the recalculators use `saveAnalysisPatch`; `AnalysisService.update` and the master-image synchronizer `Object.assign` into the locked row.
- `updateLockedEntity` is called only by repository adapters.
- better-sqlite3 runs it without a row lock and is **not** race safe.

**Event guards.** `isProcessStatusTerminal` (`core/services/helpers.ts`) means only the command path (`STARTING`) leaves a terminal status. EXECUTION_STARTED / PROGRESS / FAILED / FINISHED apply only while the locked row is `STARTING`/`STARTED` (#1960), so a late event cannot resurrect a FAILED run or one reset to `null`. A CHECK_FINISHED verdict whose `checkedAt` predates the locked row's `updatedAt` is dropped (`isCheckVerdictStale`); any write counts, so a verdict racing an unrelated write is dropped silently — re-run the check. A verdict without `checkedAt` applies. Open: run ids, to drop a previous run's late events after a new `STARTING`.

**Master-image BUILD.** It claims `STARTING` under the lock and saves it **before** dispatching. A `STARTING`/`STARTED` row younger than 15 min refuses a new BUILD (400); an older one may be taken over (master images have no check command), and the takeover stamps `updatedAt` explicitly, since an unchanged status is a no-op save. A failed dispatch keeps the claim: a rejected publish may still have reached a worker.

**Bucket reply correlation.** `CREATION_FINISHED` links by `refType: 'analysis'` + `refId` + `parseAnalysisBucketName(name)` (core-kit); a reply that resolves to no analysis bucket is ignored. Trusting it rests on storage forwarding `CREATION_FINISHED` only for core's own bus creates; as defence in depth a bucket whose `realmId` differs from the analysis's is never linked. A reply for an `(analysisId, type)` already linked to another bucket dispatches a storage delete for the new one, never the linked one; the ordered reply queue makes this check-then-link race-free without a lock. `DELETION_FINISHED` matches by bucket id. `CREATION_FAILED` is logged only; nothing re-provisions the bucket, so a missing bucket needs a `storageCheck`. Rollout: stop old server-core replicas before new ones serve traffic.

**Reconciler and staleness (F13/F14).** Workers report an in-progress process as-is; core's `applyEvent` turns a CHECK_FINISHED for an in-progress process into `FAILED` when the locked row is older than `ANALYSIS_PROCESS_STALE_THRESHOLD_MS` (15 min).

- `AnalysisReconciler` (`core/services/analysis-reconciler/`) dispatches the existing build/distribution check for in-progress rows older than the threshold, at start and every 5 min, on every replica, without a lock; duplicate verdicts are dropped by `isCheckVerdictStale`.
- `findManyInProgressUpdatedBefore` binds a `Date` through `Raw` — the timestamp-filter trap; never compare an ISO string.
- Heartbeat: the builder/distributor execute handlers re-emit their last progress every 5 min, until 2 h without real progress, so a hung stream goes stale. Core's PROGRESS branch stamps `updatedAt` explicitly when the percent is unchanged, at most once per `ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS` (1 min); otherwise the event is a no-op.
- Stale is not recovered by itself: with one worker the CHECK waits behind the hung EXECUTE on the same prefetch-1 queue, so recovery takes a worker restart, a second worker replica or `consumer_timeout`.
- The distributor check reports a permanently missing precondition (no nodes, registry or registry project) as in progress, so the stale rule fails the run.
- Ceilings: CHECKs carry no TTL and pile up while no worker consumes; master images and failed storage buckets are not reconciled.
- Rollout: workers before server-core.

**Bucket uniqueness and refs (F12).** Core `analysis_buckets` is unique on `(analysisId, type)`; storage `buckets` on `(refType, refId, name)` (NULL refs unconstrained). Storage's create handler replies with the existing bucket for the same ref + name + realm and resolves a lost unique race to the winner. `POST /buckets` answers 400 for a `refId`: storage cannot verify who owns the referenced resource, so only the owning service sets refs, over the bus. Uploads to a bucket without a `refId` require ownership or `BUCKET_UPDATE` with realm access (`BucketService.checkUploadAccess`); a ref'd bucket relies on server-core's after-the-fact check until capability tokens land. The create handler records the actor of a trusted sender: the HTTP identity (overriding the body) or the bus payload.

Still open: the authup aggregator on redis pub/sub (F20), run ids, a TTL for the reconciler's CHECK backlog, master-image reconciling.
