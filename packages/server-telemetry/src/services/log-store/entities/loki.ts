/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { DistributorPushStream, LokiClient, QuerierQueryRangeOptions } from '@hapic/loki';
import type { Log, LogInput, LogLevel } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag, normalizeLogInput } from '@privateaim/telemetry-kit';
import { isClientError } from 'hapic';
import type { LogStore, LogStoreDeleteOptions, LogStoreQueryOptions } from '../types';

export class LokiLogStore implements LogStore {
    protected instance : LokiClient;

    constructor(instance: LokiClient) {
        this.instance = instance;
    }

    async write(input: LogInput): Promise<Log> {
        const output = normalizeLogInput(input);

        const stream : DistributorPushStream = {
            stream: {
                ...output.labels,
                [LogFlag.CHANNEL]: output.channel,
                [LogFlag.LEVEL]: output.level,
                [LogFlag.SERVICE]: output.service,
            },
            values: [
                [
                    output.time,
                    output.message,
                ],
            ],
        };

        await this.instance.distributor.push(stream);

        return output;
    }

    async delete(options: LogStoreDeleteOptions): Promise<void> {
        try {
            await this.instance.compactor.createDeletionRequest({
                start: options.start,
                ...(options.end ? { end: options.end } : {}),
                query: this.buildQuery({
                    ...(options.labels || {}),
                }),
            });
        } catch (e) {
            if (isClientError(e)) {
                if (e.response && e.response.status === 404) {
                    return;
                }
            }

            throw e;
        }
    }

    async query(input: LogStoreQueryOptions): Promise<[Log[], number]> {
        const options : QuerierQueryRangeOptions = {
            query: this.buildQuery({
                ...(input.labels || {}),
            }),
        };

        if (input.sort) {
            options.direction = input.sort === 'ASC' ? 'forward' : 'backward';
        }

        if (input.limit) {
            options.limit = input.limit;
        }

        if (input.start) {
            options.start = BigInt(input.start) * 1_000_000n;
        }

        if (input.end) {
            options.end = BigInt(input.end) * 1_000_000n;
        }

        const output : Log[] = [];
        const response = await this.instance.querier.queryRange(options);
        if (response.data.resultType === 'streams') {
            for (let i = 0; i < response.data.result.length; i++) {
                const set = response.data.result[i];

                // channel
                let channel : LogChannel;
                if (set.stream[LogFlag.CHANNEL]) {
                    channel = set.stream[LogFlag.CHANNEL] as LogChannel;
                    delete set.stream[LogFlag.CHANNEL];
                } else {
                    channel = LogChannel.SYSTEM;
                }

                // level
                let level : LogLevel;
                if (set.stream[LogFlag.LEVEL]) {
                    level = set.stream[LogFlag.LEVEL] as LogLevel;
                    delete set.stream[LogFlag.LEVEL];
                } else {
                    level = set.stream.detected_level as LogLevel;
                }
                delete set.stream.detected_level;

                // service
                let service : string;
                if (set.stream[LogFlag.SERVICE]) {
                    service = set.stream[LogFlag.SERVICE];
                    delete set.stream[LogFlag.SERVICE];
                } else if (set.stream.service_name) {
                    service = set.stream.service_name;
                } else {
                    service = 'unknown';
                }
                delete set.stream.service_name;

                for (let j = 0; j < set.values.length; j++) {
                    output.push({
                        channel,
                        service,
                        time: BigInt(set.values[j][0]),
                        message: set.values[j][1],
                        level,
                        labels: set.stream,
                    } satisfies Log);
                }
            }
        }

        return [output, output.length];
    }

    // ----------------------------------------------

    protected buildQuery(labels: Record<string, any>) : string {
        const output : string[] = [];

        const keys = Object.keys(labels);
        for (let i = 0; i < keys.length; i++) {
            output.push(`${keys[i]}="${labels[keys[i]]}"`);
        }

        return `{${output.join(',')}}`;
    }
}
