/*
 * Copyright (c) 2026.
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { isRealmResourceReadable } from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { CommunicationMeasurement } from '@privateaim/communication-kit';
import { deriveMeasurements } from '@privateaim/communication-kit';
import type { BucketFile, APIClient as StorageClient } from '@privateaim/storage-kit';
import type { Log, APIClient as TelemetryClient } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import {
    DContext,
    DController,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ForceLoggedInMiddleware, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import {
    AnalysisBucketEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
} from '../../../../database/index.ts';

type AnalysisCommunicationSummaryControllerContext = {
    telemetryClient?: TelemetryClient;
    storageClient?: StorageClient;
};

export type AnalysisCommunicationSummary = {
    schema_version: number;
    generated_at: string;
    measurements: CommunicationMeasurement[];
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
    protected telemetryClient?: TelemetryClient;

    protected storageClient?: StorageClient;

    protected cache = new Map<string, { expiresAt: number, payload: AnalysisCommunicationSummary }>();

    constructor(ctx: AnalysisCommunicationSummaryControllerContext = {}) {
        this.telemetryClient = ctx.telemetryClient;
        this.storageClient = ctx.storageClient;
    }

    @DGet('/:id/communication-summary', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ) : Promise<AnalysisCommunicationSummary> {
        const dataSource = await useDataSource();

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.findOneBy({ id });
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        // same bar as viewing the analysis itself — the summary contains only
        // aggregated counts/sizes, no raw log content, so it deliberately does
        // NOT require the telemetry log permissions.
        if (!isRealmResourceReadable(useRequestIdentityRealm(event), analysis.realm_id)) {
            throw new PermissionDeniedError('You are not permitted to view this analysis.');
        }

        const cached = this.cache.get(id);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.payload;
        }

        const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        const nodes = await analysisNodeRepository.find({
            where: { analysis_id: id },
            relations: { node: true },
        });

        // a temporarily unreachable telemetry/storage service degrades the
        // summary (missing events or sizes) instead of failing the request;
        // degraded payloads are not cached so recovery is immediate.
        let degraded = false;

        const logs : Record<string, Log[]> = {};
        if (this.telemetryClient) {
            await Promise.all(nodes.map(async (item) => {
                try {
                    logs[item.node_id] = await this.fetchNodeLogs(id, item.node_id);
                } catch {
                    degraded = true;
                }
            }));
        }

        const filesByType : Record<string, BucketFile[]> = {};
        if (this.storageClient) {
            const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
            const buckets = await bucketRepository.findBy({ analysis_id: id });

            await Promise.all(buckets.map(async (bucket) => {
                try {
                    const response = await this.storageClient.bucketFile.getMany({ filter: { bucket_id: bucket.bucket_id } });
                    filesByType[bucket.type] = response.data;
                } catch {
                    degraded = true;
                }
            }));
        }

        const payload : AnalysisCommunicationSummary = {
            schema_version: 1,
            generated_at: new Date().toISOString(),
            measurements: deriveMeasurements({
                nodes,
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
                        analysis_id: analysisId,
                        node_id: nodeId,
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
