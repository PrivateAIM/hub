/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type {
    LogStore,
} from '@privateaim/server-kit';
import type { AnalysisNodeLogDeleteOptions, AnalysisNodeLogQueryOptions } from './types';

export class AnalysisNodeLogStore {
    protected instance : LogStore;

    constructor(instance: LogStore) {
        this.instance = instance;
    }

    async write(event: AnalysisNodeLog): Promise<void> {
        let time : bigint | undefined;
        if (event.created_at) {
            time = BigInt(new Date(`${event.created_at}`).getTime()) * 1_000_000n;
        }

        await this.instance.write({
            labels: this.buildLabels(event),
            message: event.message,
            time,
        });
    }

    async delete(options: AnalysisNodeLogDeleteOptions): Promise<void> {
        const labels = this.buildLabels({
            analysis_id: options.analysis_id,
            node_id: options.node_id,
        });

        await this.instance.delete({
            ...options,
            labels,
        });
    }

    async query(input: AnalysisNodeLogQueryOptions): Promise<[AnalysisNodeLog[], number]> {
        const labels = this.buildLabels({
            analysis_id: input.analysis_id,
            node_id: input.node_id,
        });

        const [data, total] = await this.instance.query({
            ...input,
            labels: {
                ...labels,
            },
        });

        const output : AnalysisNodeLog[] = [];

        for (let i = 0; i < data.length; i++) {
            let date : Date;
            if (data[i].time) {
                date = new Date(Number(data[i].time / 1_000_000n));
            } else {
                date = new Date(Date.now() + i);
            }

            output.push({
                id: `${date.getTime()}`,
                message: data[i].message,
                created_at: date.toISOString() as unknown as Date,
                updated_at: date.toISOString() as unknown as Date,
                analysis_id: input.analysis_id,
                node_id: input.node_id,
            } satisfies Partial<AnalysisNodeLog> as AnalysisNodeLog);
        }

        return [output, total];
    }

    // ----------------------------------------------

    protected buildLabels(
        entity: Partial<AnalysisNodeLog>,
    ) : Record<string, string> {
        return {
            ...(entity.level ? { level: entity.level } : {}),
            ...(entity.code ? { code: entity.code } : {}),
            entity: 'analysisNode',
            ...(entity.node_id ? { entity_node_id: entity.node_id } : {}),
            ...(entity.analysis_id ? { entity_analysis_id: entity.analysis_id } : {}),
        };
    }
}
