/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { pickRecord } from '@authup/kit';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { AnalysisNodeLogValidator, DomainType  } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import type { Log, LogLevel, APIClient as TelemetryClient } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { BadRequestError, ForbiddenError } from '@ebec/http';
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
import type { FiltersBuildInput } from 'rapiq';
import { parseQuery, parseQueryFilters } from 'rapiq';
import type { IRoutupEvent } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ForceLoggedInMiddleware, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { ValidupError, buildErrorMessageForAttribute, defineIssueItem } from 'validup';
import {
    AnalysisEntity,
    NodeEntity,
} from '../../../../database/index.ts';

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
        @DContext() event: IRoutupEvent,
    ) {
        const output = parseQuery<AnalysisNodeLog>(useRequestQuery(event), {
            filters: {
                allowed: [
                    'level',
                    'analysis_id',
                    'node_id',
                ],
            },
            pagination: { maxLimit: 50 },
            sort: { allowed: ['time'] },
        });

        const filtersNormalized : Partial<Record<keyof AnalysisNodeLog, string>> = {};
        if (output.filters) {
            for (let i = 0; i < output.filters.length; i++) {
                filtersNormalized[output.filters[i].key] = `${output.filters[i].value}`;
            }
        }

        if (!filtersNormalized.analysis_id || !filtersNormalized.node_id) {
            throw new BadRequestError('The filters node_id and analysis_id must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
                analysis_id: filtersNormalized.analysis_id,
                node_id: filtersNormalized.node_id,
            },
        };

        if (filtersNormalized.level) {
            filters.level = filtersNormalized.level as LogLevel;
        }

        if (this.telemetryClient) {
            return this.telemetryClient.log.getMany({
                filters,
                pagination: output.pagination,
            });
        }

        return {
            data: [],
            meta: {
                total: 0,
                pagination: {
                    limit: 50,
                    offset: 0,
                },
            },
        };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() body: Partial<AnalysisNodeLog>,
        @DContext() event: IRoutupEvent,
    ): Promise<Log> {
        const validator = new AnalysisNodeLogValidator();
        const data = await validator.run(body, { group: 'create' });

        const dataSource = await useDataSource();
        const nodeRepository = dataSource.getRepository(NodeEntity);
        const node = await nodeRepository.findOneBy({ id: data.node_id });
        if (!node) {
            throw new ValidupError([
                defineIssueItem({
                    path: ['node_id'],
                    message: buildErrorMessageForAttribute('node_id'),
                }),
            ]);
        }

        data.node_realm_id = node.realm_id;

        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.findOneBy({ id: data.analysis_id });
        if (!analysis) {
            throw new ValidupError([
                defineIssueItem({
                    path: ['analysis_id'],
                    message: buildErrorMessageForAttribute('analysis_id'),
                }),
            ]);
        }

        data.analysis_realm_id = analysis.realm_id;

        const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(event), data.node_realm_id);
        if (!isAuthorityOfNode) {
            throw new ForbiddenError('You are not an actor of to the node realm.');
        }

        const labels : Record<string, string> = {};
        const labelsRaw = {
            ...(data.labels || {}),
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
            ...pickRecord(data, [
                'analysis_id',
                'node_id',
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
        return entity;
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DContext() event: IRoutupEvent,
    ) {
        const output = parseQueryFilters<AnalysisNodeLog>(
            useRequestQuery(event, 'filter'),
            {
                allowed: [
                    'analysis_id',
                    'node_id',
                ],
            },
        );

        const filtersNormalized : Partial<Record<keyof AnalysisNodeLog, string>> = {};
        if (output) {
            for (const element of output) {
                filtersNormalized[element.key] = `${element.value}`;
            }
        }

        if (!filtersNormalized.analysis_id || !filtersNormalized.node_id) {
            throw new BadRequestError('The filters node_id and analysis_id must be defined.');
        }

        const filters : FiltersBuildInput<Log> = {
            labels: {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
                analysis_id: filtersNormalized.analysis_id,
                node_id: filtersNormalized.node_id,
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
