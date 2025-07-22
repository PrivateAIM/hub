/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisLog } from '@privateaim/core-kit';
import type {
    LogInput,
    LogStore,
} from '@privateaim/server-kit';
import type { Log } from '@privateaim/kit';
import type { AnalysisLogDeleteOptions, AnalysisLogQueryOptions } from './types';

export class AnalysisLogStore {
    protected instance : LogStore;

    constructor(instance: LogStore) {
        this.instance = instance;
    }

    async write(event: AnalysisLog): Promise<Log> {
        const data : LogInput = {
            labels: this.buildLabels(event),
            message: event.message,
            level: event.level,
        };

        const output = await this.instance.write(data);
        output.time = typeof output.time === 'bigint' ? output.time.toString() : output.time;

        return output;
    }

    async delete(options: AnalysisLogDeleteOptions): Promise<void> {
        const labels = this.buildLabels({
            analysis_id: options.analysis_id,
        });

        await this.instance.delete({
            ...options,
            labels,
        });
    }

    async query(input: AnalysisLogQueryOptions): Promise<[Log[], number]> {
        const labels = this.buildLabels({
            analysis_id: input.analysis_id,
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
        entity: Partial<AnalysisLog>,
    ) : Record<string, string> {
        const output : Record<string, string> = {
            entity: 'analysis',
        };
        const keys = Object.keys(entity);

        for (let i = 0, { length } = keys; i < length; i++) {
            output[keys[i]] = entity[keys[i]];
        }

        return output;
    }
}
