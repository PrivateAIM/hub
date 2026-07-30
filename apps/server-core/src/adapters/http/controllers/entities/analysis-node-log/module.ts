/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { pickRecord } from '@authup/kit';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { AnalysisNodeLogValidator, DomainType  } from '@privateaim/core-kit';
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import type { Log, LogLevel, ITelemetryClient as TelemetryClient } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { FiltersBuildInput } from '@rapiq/core';
import type { IAppEvent } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ForceLoggedInMiddleware, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { describeQuerySchema } from '@privateaim/server-kit';
import { ValidupError, buildErrorMessageForAttribute, defineIssueItem } from 'validup';
import {
    AnalysisEntity,
    NodeEntity,
} from '../../../../database/index.ts';
import { analysisNodeLogSchema, collectRootFilterValues, decodeQuery } from '../../../../../core/index.ts';

type AnalysisNodeLogControllerContext = {
    telemetryClient?: TelemetryClient;
};

@DTags('analysis')
@DController('/analysis-node-logs')
export class AnalysisNodeLogController {
    protected telemetryClient?: TelemetryClient;

    constructor(ctx: AnalysisNodeLogControllerContext = {}) {
        this.telemetryClient = ctx.telemetryClient;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Log>> {
        const query = decodeQuery(useRequestQuery(event), { schema: analysisNodeLogSchema });

        const filtersNormalized = collectRootFilterValues(query);

        if (!filtersNormalized.analysisId || !filtersNormalized.nodeId) {
            throw new BadRequestError('The filters nodeId and analysisId must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
                analysisId: filtersNormalized.analysisId,
                nodeId: filtersNormalized.nodeId,
            },
        };

        if (filtersNormalized.level) {
            filters.level = filtersNormalized.level as LogLevel;
        }

        if (this.telemetryClient) {
            const { data, meta } = await this.telemetryClient.log.getMany({
                filters,
                pagination: {
                    limit: query.pagination.limit,
                    offset: query.pagination.offset,
                },
            });

            return { data, meta: { ...meta, schema: describeQuerySchema(analysisNodeLogSchema) } };
        }

        return {
            data: [],
            meta: {
                total: 0,
                limit: 50,
                offset: 0,
                schema: describeQuerySchema(analysisNodeLogSchema),
            },
        };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() body: Partial<AnalysisNodeLog>,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Log>> {
        const validator = new AnalysisNodeLogValidator();
        const data = await validator.run(body, { group: 'create' });

        const dataSource = await useDataSource();
        const nodeRepository = dataSource.getRepository(NodeEntity);
        const node = await nodeRepository.findOneBy({ id: data.nodeId });
        if (!node) {
            throw new ValidupError([
                defineIssueItem({
                    path: ['nodeId'],
                    message: buildErrorMessageForAttribute('nodeId'),
                }),
            ]);
        }

        data.nodeRealmId = node.realmId;

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.findOneBy({ id: data.analysisId });
        if (!analysis) {
            throw new ValidupError([
                defineIssueItem({
                    path: ['analysisId'],
                    message: buildErrorMessageForAttribute('analysisId'),
                }),
            ]);
        }

        data.analysisRealmId = analysis.realmId;

        const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(event), data.nodeRealmId);
        if (!isAuthorityOfNode) {
            throw new PermissionDeniedError('You are not an actor of the node realm.');
        }

        const labels : Record<string, string> = {};
        const labelsRaw = {
            ...(data.labels || {}),
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
            ...pickRecord(data, [
                'analysisId',
                'nodeId',
                'code',
                'status',
            ]),
        };

        const keys = Object.keys(labelsRaw);
        for (const key of keys) {
            if (typeof labelsRaw[key] === 'string') {
                labels[key] = labelsRaw[key];
            }
        }

        const entity : Log = {
            time: new Date().toISOString(),
            level: data.level as LogLevel,
            channel: LogChannel.HTTP,
            service: 'hub-server-core',
            message: data.message,
            labels,
        };

        if (this.telemetryClient) {
            await this.telemetryClient.log.create(entity);
        }

        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DContext() event: IAppEvent,
    ) {
        const query = decodeQuery(useRequestQuery(event), {
            schema: analysisNodeLogSchema,
            parameters: ['filters'],
        });

        const filtersNormalized = collectRootFilterValues(query);

        if (!filtersNormalized.analysisId || !filtersNormalized.nodeId) {
            throw new BadRequestError('The filters nodeId and analysisId must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
                analysisId: filtersNormalized.analysisId,
                nodeId: filtersNormalized.nodeId,
            },
            time: `${((BigInt(Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 31 * 12 * 10))) * 1_000_000n).toString()}`,
        };

        if (this.telemetryClient) {
            await this.telemetryClient.log.deleteMany({ filters });
        }

        event.response.status = 202;
        return null;
    }
}
