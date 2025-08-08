/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogLevel } from '@privateaim/telemetry-kit';
import { isClientError } from 'hapic';
import type { DistributorPushStream, LokiClient, QuerierQueryRangeOptions } from '@hapic/loki';
import { nanoSeconds } from '@hapic/loki';
import type {
    LogStore, LogStoreDeleteOptions, LogStoreQueryOptions,
} from '../types';
import { BaseLogStore } from './base';

export class LokiLogStore extends BaseLogStore implements LogStore {
    protected instance : LokiClient;

    constructor(instance: LokiClient, labels?: Record<string, string>) {
        super();

        this.instance = instance;
        this.labels = labels || {};
    }

    async write(message: string | LogInput, labels?: Record<string, string>): Promise<Log> {
        let data : Log;

        if (typeof message === 'string') {
            const labelsNormalized = {
                ...this.labels,
                ...(labels || {}),
            };
            const level = (labelsNormalized.level || LogLevel.DEBUG) as LogLevel;
            delete labelsNormalized.level;

            data = {
                message,
                level,
                time: nanoSeconds(),
                labels: labelsNormalized,
            };
        } else {
            const labelsNormalized = {
                ...this.labels,
                ...(message.labels || {}),
                ...(labels || {}),
            };

            const level = (message.level || labelsNormalized.level || LogLevel.DEBUG) as LogLevel;
            delete labelsNormalized.level;

            data = {
                ...message,
                level,
                time: message.time || nanoSeconds(),
                labels: labelsNormalized,
            };
        }

        const stream : DistributorPushStream = {
            stream: data.labels,
            values: [
                [data.time, data.message, { level: data.level }],
            ],
        };

        await this.instance.distributor.push(stream);

        return data;
    }

    async delete(options: LogStoreDeleteOptions): Promise<void> {
        try {
            await this.instance.compactor.createDeletionRequest({
                start: options.start,
                ...(options.end ? { end: options.end } : {}),
                query: this.buildQuery({
                    ...this.labels,
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
                ...this.labels,
                ...(input.labels || {}),
            }),
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

        const output : Log[] = [];
        const response = await this.instance.querier.queryRange(options);
        if (response.data.resultType === 'streams') {
            for (let i = 0; i < response.data.result.length; i++) {
                const set = response.data.result[i];

                const labels = set.stream;
                let level : LogLevel;

                if (labels.level) {
                    level = labels.level as LogLevel;
                } else {
                    level = labels.detected_level as LogLevel;
                }
                delete labels.level;
                delete labels.detected_level;

                if (!labels.service) {
                    labels.service = labels.service_name;
                }
                delete labels.service_name;

                for (let j = 0; j < set.values.length; j++) {
                    output.push({
                        time: BigInt(set.values[j][0]),
                        message: set.values[j][1],
                        level,
                        labels,
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
