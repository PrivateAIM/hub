/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { IngestorData, QuerierQueryOptions, VictoriaLogsClient } from '@hapic/victorialogs';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import {
    LogChannel, LogFlag, LogLevel, normalizeLogInput,
} from '@privateaim/telemetry-kit';
import type { LogStore, LogStoreQueryOptions } from '../types';

export class VictoriaLogsLogStore implements LogStore {
    protected instance : VictoriaLogsClient;

    constructor(instance: VictoriaLogsClient) {
        this.instance = instance;
    }

    async write(input: LogInput): Promise<Log> {
        const output = normalizeLogInput(input);

        const stream : IngestorData = {
            _msg: output.message,
            _time: '0',
            ...output.labels,
            [LogFlag.CHANNEL]: output.channel,
            [LogFlag.LEVEL]: output.level,
            [LogFlag.SERVICE]: output.service,
        };

        await this.instance.ingestor.insert(stream);

        await this.instance.post('insert/loki/api/v1/push', {
            streams: [
                {
                    stream: {

                        ...output.labels,
                        [LogFlag.CHANNEL]: output.channel,
                        [LogFlag.LEVEL]: output.level,
                        [LogFlag.SERVICE]: output.service,
                    },
                    values: [
                        ['0', output.message],
                    ],
                },
            ],
        });

        return output;
    }

    async delete(): Promise<void> {
        // todo: implement delete endpoint
    }

    async query(input: LogStoreQueryOptions): Promise<[Log[], number]> {
        const options : QuerierQueryOptions = {
            query: this.buildQuery(
                {
                    ...input.labels || {},
                },
                input.sort,
            ),
        };

        if (input.limit) {
            options.limit = input.limit;
        }

        if (input.offset) {
            options.offset = input.offset;
        }

        if (input.start) {
            options.start = new Date(input.start).toISOString();
        }

        if (input.end) {
            options.end = new Date(input.start).toISOString();
        }

        const output : Log[] = [];

        const data = await this.instance.querier.query({
            query: options.query,
        });

        for (let i = 0; i < data.length; i++) {
            const {
                _time: time,
                _msg: message,
                [LogFlag.CHANNEL]: channel,
                [LogFlag.LEVEL]: level,
                [LogFlag.SERVICE]: service,
                ...labelsRaw
            } = data[i];

            const labels : Record<string, string> = {};
            const keys = Object.keys(labelsRaw);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].startsWith('_')) {
                    continue;
                }

                labels[keys[i]] = labelsRaw[keys[i]];
            }

            output.push({
                channel: (channel) as LogChannel || LogChannel.SYSTEM,
                service: service || 'unknown',
                time,
                message,
                level: (level as LogLevel) || LogLevel.INFORMATIONAL,
                labels,
            } satisfies Log);
        }

        return [output, output.length];
    }

    // ----------------------------------------------

    protected buildQuery(labels: Record<string, any>, sort: 'DESC' | 'ASC' = 'DESC') : string {
        const filters : string[] = [];

        const keys = Object.keys(labels);

        for (let i = 0; i < keys.length; i++) {
            filters.push(`${keys[i]}:="${labels[keys[i]]}"`);
        }

        const query = filters.length > 0 ? filters.join(' AND ') : '*';

        return `${query} | sort by (_time ${sort})`;
    }
}
