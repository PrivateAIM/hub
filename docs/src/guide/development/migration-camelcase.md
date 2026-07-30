# Migration — camelCase fields

Hub's HTTP API, domain types and npm packages moved every field name from
`snake_case` to `camelCase`. Database column names did **not** change.

This is a breaking change. There are **no** `snake_case` aliases and no
deprecation window — and, importantly, **almost nothing errors**: an old name is
silently dropped by the query parser or silently ignored by the validator,
depending on where it appears. Do not expect a 4xx to find these for you.

Tracks [#1501](https://github.com/PrivateAIM/hub/issues/1501).

## What changed

`realm_id` → `realmId`, `created_at` → `createdAt`, `display_name` →
`displayName`, and so on for every multi-word field. The rename applies
uniformly to:

- **Response bodies** — every entity field, in both the `{ data, meta }` record
  envelope and collections.
- **Request bodies** — `POST` / `PATCH` payloads for every entity.
- **Query parameters** — the rapiq vocabulary: `fields`, `filter`, `sort`,
  `include`. Relation names move too (`include=master_image` →
  `include=masterImage`).
- **`meta.schema`** — the published allow-lists now list camelCase keys.
- **Telemetry log labels** — `ref_type` / `ref_id` → `refType` / `refId`
  (`LogFlag`), and alongside them `actor_type` / `actor_id` → `actorType` /
  `actorId`, `target_type` / `target_id` → `targetType` / `targetId`, and
  `bucket_type` → `bucketType`.
- **The npm packages** — `@privateaim/core-kit`, `core-http-kit`, `storage-kit`,
  `telemetry-kit`, `messenger-kit`, `messenger-http-kit`, `client-vue`.

### Before / after

```http
GET /nodes?filter[realm_id]=<id>&sort=-created_at&fields=%2Bexternal_name&include=registry_project
```

```http
GET /nodes?filter[realmId]=<id>&sort=-createdAt&fields=%2BexternalName&include=registryProject
```

```jsonc
// before
{ "data": { "id": "…", "display_name": "Node A", "realm_id": "…", "created_at": "…" }, "meta": {} }

// after
{ "data": { "id": "…", "displayName": "Node A", "realmId": "…", "createdAt": "…" }, "meta": {} }
```

## What did NOT change

| Surface | Still `snake_case` |
|---|---|
| Database columns | `realm_id`, `created_at`, … — pinned per column, unchanged |
| Permission names | `analysis_create`, `node_update`, `registry_manage`, … |
| OAuth2 / OIDC parameters | `client_id`, `client_secret`, `grant_type`, `redirect_uri`, `code_verifier` |
| Token introspection payloads | `realm_id`, `sub_kind`, `sub_name`, … |
| Environment variables | `DB_TYPE`, `AUTHUP_URL`, `MINIO_*`, … |
| Table names | `analysis_nodes`, `registry_projects`, … |

Permission names are unchanged because they are stored in Authup, so nothing has
to be re-provisioned.

## Upgrading

### API and npm consumers

Rename the fields you send and read. `meta.schema` on any query-capable `GET` is
the authoritative list of accepted `fields` / `filter` / `sort` / `include` keys
for that endpoint — query it if you are unsure:

```http
GET /nodes?pagination[limit]=1
```

Failure modes to expect while migrating:

- An unknown **filter**, **sort** or **`include`** key is **silently dropped,
  not rejected**. rapiq's `throwOnFailure` is deliberately not enabled, so a
  stale `filter[realm_id]` does not fail — the filter is pruned and the endpoint
  answers with a **wider, unfiltered** result set. This is the failure mode to
  watch for: it looks like success. (`strict: true` on hub's schemas does not
  change this — it governs parameters that declare *no* allow-list, and every
  hub schema declares one.)
- An unknown **request-body** key is dropped by the validator, so a write appears
  to succeed while leaving the field unset. Check the response body.
- An unknown **`fields`** entry does not error; the field is simply absent from
  the response.

Because none of these raise, diff every key you send against `meta.schema`
rather than waiting for an error.

### Database

No action. No migration ships with this change: every renamed property carries an
explicit column name, so the physical schema is byte-identical. A run → revert →
run round-trip over the existing migrations is unaffected.

### Telemetry / logs

Log lines written **before** the upgrade carry `ref_type` / `ref_id` labels and
are not selectable under the new `refType` / `refId` names — VictoriaLogs stores
label keys verbatim. Entity views (the analysis log panel) will therefore show
only post-upgrade lines. Existing rows are not rewritten; they age out with your
retention policy. Query old lines directly by their old label names if you need
them.

Anything outside Hub that writes logs (node-side components posting to
`/logs` or `/analysis-node-logs`) must switch label names in lockstep.

### Node-side components

These flat, non-envelope endpoints changed field names and need coordinated node
updates:

- `POST /analysis-node-logs` — body keys `analysis_id`, `node_id`,
  `node_realm_id`, `analysis_realm_id` → camelCase.
- `GET` / `POST /nodes/:id/client/credentials` — `display_name` →
  `displayName`, in the response **and** in the `POST` request body. The body has
  no validator, so a legacy `display_name` key is silently dropped: the secret
  still rotates and the response is `200`, while the display name stays
  unchanged.
- `GET` / `POST /analyses/:id/client/credentials` — response `display_name` →
  `displayName`. The `POST` body (`{ secret }`) is unchanged. Node-callable: a
  client whose node holds an approved `analysisNode` row may read these.
- `GET /nodes/:id/registry/credentials` — `account_name`, `account_secret`,
  `external_name` → camelCase.
- `POST /analyses/:id/client/permissions` — body key `permission_id` →
  `permissionId`.
- The messenger broker surface (`POST /messages`, pull, ack) — `sender_type`,
  `sender_id`, `recipient_type`, `recipient_id`, `created_at` → camelCase.

### Stored URLs

Bookmarked or emailed links carrying `?filter[realm_id]=…`-style query strings
stop filtering as intended: the key is silently dropped, so the link returns an
unfiltered result set rather than an error. Re-create them.

### Audit event diffs

Telemetry `events.data.diff` records which entity fields changed, keyed by field
name. Rows written before the upgrade keep their `snake_case` keys. They are
rendered as-is and never matched by name, so they are left untouched rather than
rewritten.
