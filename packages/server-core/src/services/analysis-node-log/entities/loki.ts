/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { LokiClient, LokiDistributorPushStream, LokiQuerierQueryRangeOptions } from '@privateaim/server-kit';
import { nanoSeconds } from '@privateaim/server-kit';
import type { AnalysisNodeLogDeleteOptions, AnalysisNodeLogQueryOptions, AnalysisNodeLogStore } from '../types';

export class AnalysisNodeLogLokiStore implements AnalysisNodeLogStore {
    protected instance : LokiClient;

    constructor(instance: LokiClient) {
        this.instance = instance;
    }

    async write(event: AnalysisNodeLog): Promise<AnalysisNodeLog> {
        await this.instance.distributor.push(this.transformToStream(event));

        return event;
    }

    async delete(options: AnalysisNodeLogDeleteOptions): Promise<void> {
        const labels = this.buildLabels({
            analysis_id: options.analysis_id,
            node_id: options.node_id,
        });

        await this.instance.compactor.createDeletionRequest({
            start: options.start,
            ...(options.end ? { end: options.end } : {}),
            query: this.buildQueryForLabels(labels),
        });
    }

    async query(input: AnalysisNodeLogQueryOptions): Promise<[AnalysisNodeLog[], number]> {
        const labels = this.buildLabels({
            analysis_id: input.analysis_id,
            node_id: input.node_id,
        });
        const options : LokiQuerierQueryRangeOptions = {
            query: this.buildQueryForLabels(labels),
        };

        if (input.sort) {
            options.direction = input.sort === 'DESC' ? 'forward' : 'backward';
        }

        if (input.limit) {
            options.limit = input.limit;
        }

        if (input.start) {
            options.start = BigInt(new Date(`${input.start}`).getTime()) * 1_000_000n;
        }

        if (input.end) {
            options.end = BigInt(new Date(`${input.end}`).getTime()) * 1_000_000n;
        }

        const output : AnalysisNodeLog[] = [];

        const response = await this.instance.querier.queryRange(options);
        if (response.data.resultType === 'streams') {
            for (let i = 0; i < response.data.result.length; i++) {
                const set = response.data.result[i];

                for (let j = 0; j < set.value.length; j++) {
                    const date = new Date(Number(BigInt(set.value[j][0]) / 1_000_000n));

                    output.push({
                        ...set.stream,
                        id: `${date.getTime()}`,
                        message: set.value[j][0],
                        created_at: date.toISOString() as unknown as Date,
                        updated_at: date.toISOString() as unknown as Date,
                        analysis_id: input.analysis_id,
                        node_id: input.node_id,
                    } satisfies Partial<AnalysisNodeLog> as AnalysisNodeLog);
                }
            }
        }

        return [output, output.length];
    }

    // ----------------------------------------------

    buildLabels(
        entity: Pick<AnalysisNodeLog, 'analysis_id' | 'node_id'>,
    ) : Record<string, string> {
        return {
            app: 'hub',
            component: 'serverCore',
            analysis_id: entity.analysis_id,
            node_id: entity.node_id,
        };
    }

    buildQueryForLabels(labels: Record<string, any>) : string {
        const output : string[] = [];

        const keys = Object.keys(labels);
        for (let i = 0; i < keys.length; i++) {
            output.push(`${keys[i]}="${labels[keys[i]]}"`);
        }

        return `{${output.join(',')}}`;
    }

    transformToStream(
        entity: AnalysisNodeLog,
    ) : LokiDistributorPushStream {
        return {
            stream: this.buildLabels(entity),
            values: [
                [nanoSeconds(), entity.message],
            ],
        };
    }
}
