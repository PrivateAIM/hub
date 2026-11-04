/*
 * Copyright (c) 2026.
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { AnalysisBucket, AnalysisNode  } from '@privateaim/core-kit';
import { deriveMeasurements } from '@privateaim/communication-kit';
import type { BucketFile, IStorageClient as StorageClient } from '@privateaim/storage-kit';
import type { Log, ITelemetryClient as TelemetryClient } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import {
    DContext,
    DController,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import type { IEntityRepository } from '@privateaim/server-kit';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import type { IAnalysisNodeRepository } from '../../../../../core/entities/analysis-node/types.ts';
import type { IAnalysisLogAccessService } from '../../../../../core/services/analysis-log-access/index.ts';
import { LogAccessIntent } from '../../../../../core/services/analysis-log-access/index.ts';
import type { AnalysisCommunicationSummary } from './types.ts';

type AnalysisCommunicationSummaryControllerContext = {
    accessService: IAnalysisLogAccessService;
    analysisNodeRepository: IAnalysisNodeRepository;
    analysisBucketRepository: IEntityRepository<AnalysisBucket>;
    telemetryClient?: TelemetryClient;
    storageClient?: StorageClient;
};

// v1 caching: repeated requests within the window reuse the computed summary
// instead of re-reading the log store. Event-driven invalidation can replace
// this later.
const CACHE_TTL_MS = 45_000;

// safety bound so a pathological log volume cannot make one request read
// the log store forever (100 entries per page)
const LOG_PAGE_BUDGET = 50;

@DTags('analysis')
@DController('/analyses')
export class AnalysisCommunicationSummaryController {
    protected accessService: IAnalysisLogAccessService;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected analysisBucketRepository: IEntityRepository<AnalysisBucket>;

    protected telemetryClient?: TelemetryClient;

    protected storageClient?: StorageClient;

    protected cache = new Map<string, { expiresAt: number, payload: AnalysisCommunicationSummary }>();

    constructor(ctx: AnalysisCommunicationSummaryControllerContext) {
        this.accessService = ctx.accessService;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
        this.telemetryClient = ctx.telemetryClient;
        this.storageClient = ctx.storageClient;
    }

    @DGet('/:id/communication-summary', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ) : Promise<AnalysisCommunicationSummary> {
        // The summary is derived from the analysis' node logs, so it is read
        // with the analysis-log access bar (plan 021, D2): the analysis read
        // one-of through the grant's reach, or approved participation. Out of
        // reach answers 404, like a missing analysis.
        await this.accessService.assertAnalysisLogAccess(id, buildActorContext(event), LogAccessIntent.READ);

        const cached = this.cache.get(id);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.payload;
        }

        const nodes = await this.analysisNodeRepository.findManyWithNodeByAnalysis(id);

        // a temporarily unreachable telemetry/storage service degrades the
        // summary (missing events or sizes) instead of failing the request;
        // degraded payloads are not cached so recovery is immediate.
        let degraded = false;

        const logs : Record<string, Log[]> = {};

        if (this.telemetryClient) {
            await Promise.all(nodes.map(async (item) => {
                try {
                    logs[item.nodeId] = await this.fetchNodeLogs(id, item.nodeId);
                } catch {
                    degraded = true;
                }
            }));
        }

        const filesByType : Record<string, BucketFile[]> = {};

        if (this.storageClient) {
            const buckets = await this.analysisBucketRepository.findManyBy({ analysisId: id });

            await Promise.all(buckets.map(async (bucket) => {
                try {
                    const response = await this.storageClient.bucketFile.getMany({ filters: { bucketId: bucket.bucketId } });

                    filesByType[bucket.type] = [
                        ...(filesByType[bucket.type] || []),
                        ...response.data,
                    ];
                } catch {
                    degraded = true;
                }
            }));
        }

        const payload : AnalysisCommunicationSummary = {
            schemaVersion: 1,
            generatedAt: new Date().toISOString(),
            measurements: deriveMeasurements({
                nodes: nodes as AnalysisNode[],
                logs,
                filesByType,
            }),
        };

        if (!degraded) {
            this.cache.set(id, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
        }

        return payload;
    }

    protected async fetchNodeLogs(analysisId: string, nodeId: string) : Promise<Log[]> {
        const collected : Log[] = [];
        let offset = 0;

        for (let page = 0; page < LOG_PAGE_BUDGET; page++) {
            const response = await this.telemetryClient.log.getMany({
                filters: {
                    labels: {
                        [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
                        analysisId,
                        nodeId,
                    },
                },
                pagination: { limit: 100, offset },
            });

            collected.push(...response.data);

            const next = offset + response.data.length;

            if (response.data.length === 0 || response.meta.total <= next) {
                break;
            }

            offset = next;
        }

        return collected;
    }
}
