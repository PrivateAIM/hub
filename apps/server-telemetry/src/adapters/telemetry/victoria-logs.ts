/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { IngestorData, QuerierQueryOptions, VictoriaLogsClient } from '@hapic/victorialogs';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import {
    LogChannel,
    LogFlag,
    LogLevel,
    normalizeLogInput,
} from '@privateaim/telemetry-kit';
import type { LogStore, LogStoreQueryOptions } from '../../core/services/log-store/types.ts';

export class VictoriaLogsLogStore implements LogStore {
    protected instance : VictoriaLogsClient;

    constructor(instance: VictoriaLogsClient) {
        this.instance = instance;
    }

    async write(input: LogInput): Promise<Log> {
        const output = normalizeLogInput(input);

        const stream : IngestorData = {
            _msg: output.message,
            _time: output.time || '0',
            ...output.labels,
            [LogFlag.CHANNEL]: output.channel,
            [LogFlag.LEVEL]: output.level,
            [LogFlag.SERVICE]: output.service,
        };

        await this.instance.ingestor.insert(stream);

        return output;
    }

    async delete(): Promise<void> {
        // todo: implement delete endpoint
    }

    async query(input: LogStoreQueryOptions): Promise<[Log[], number]> {
        const options : QuerierQueryOptions = {
            query: this.buildQuery(
                { ...input.labels || {} },
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
            options.end = new Date(input.end).toISOString();
        }

        const output : Log[] = [];

        const data = await this.instance.querier.query(options);

        for (const {
            _time: time,
            _msg: message,
            [LogFlag.CHANNEL]: channel,
            [LogFlag.LEVEL]: level,
            [LogFlag.SERVICE]: service,
            ...labelsRaw
        } of data) {
            const labels : Record<string, string> = {};
            const keys = Object.keys(labelsRaw);
            for (const key of keys) {
                if (key.startsWith('_')) {
                    continue;
                }

                labels[key] = labelsRaw[key];
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

    protected isValidLabelKey(key: string) : boolean {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
    }

    protected escapeQueryValue(value: unknown) : string {
        return String(value)
            .replaceAll('\\', '\\\\')
            .replaceAll('"', '\\"');
    }

    protected buildQuery(labels: Record<string, any>, sort: 'DESC' | 'ASC' = 'DESC') : string {
        const filters : string[] = [];

        const keys = Object.keys(labels);

        for (const key of keys) {
            if (!this.isValidLabelKey(key)) {
                continue;
            }

            const value = this.escapeQueryValue(labels[key]);
            filters.push(`${key}:="${value}"`);
        }

        const query = filters.length > 0 ? filters.join(' AND ') : '*';

        return `${query} | sort by (_time ${sort})`;
    }
}
