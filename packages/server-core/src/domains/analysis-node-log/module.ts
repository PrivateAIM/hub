/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type {
    LogInput,
    LogStore,
} from '@privateaim/server-kit';
import type { Log } from '@privateaim/kit';
import type { AnalysisNodeLogDeleteOptions, AnalysisNodeLogQueryOptions } from './types';

export class AnalysisNodeLogStore {
    protected instance : LogStore;

    constructor(instance: LogStore) {
        this.instance = instance;
    }

    async write(event: AnalysisNodeLog): Promise<Log> {
        const data : LogInput = {
            labels: this.buildLabels(event),
            message: event.message,
            level: event.level,
        };

        const output = await this.instance.write(data);
        output.time = typeof output.time === 'bigint' ? output.time.toString() : output.time;

        return output;
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

    async query(input: AnalysisNodeLogQueryOptions): Promise<[Log[], number]> {
        const labels = this.buildLabels({
            analysis_id: input.analysis_id,
            node_id: input.node_id,
        });

        const output = await this.instance.query({
            ...input,
            labels,
        });

        return [
            output[0].map((el) => {
                el.time = typeof el.time === 'bigint' ? el.time.toString() : el.time;
                return el;
            }),
            output[1],
        ];
    }

    // ----------------------------------------------

    protected buildLabels(
        entity: Partial<AnalysisNodeLog>,
    ) : Record<string, string> {
        const output : Record<string, string> = {
            entity: 'analysisNode',
        };
        const keys = Object.keys(entity);

        for (let i = 0, { length } = keys; i < length; i++) {
            output[keys[i]] = entity[keys[i]];
        }

        return output;
    }
}
