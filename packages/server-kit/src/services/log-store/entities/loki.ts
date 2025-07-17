/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { LokiClient, LokiDistributorPushStream, LokiQuerierQueryRangeOptions } from '../../loki';
import { nanoSeconds } from '../../loki';
import type {
    LogMessage, LogStore, LogStoreDeleteOptions, LogStoreQueryOptions,
} from '../types';
import { BaseLogStore } from './base';

export class LokiLogStore extends BaseLogStore implements LogStore {
    protected instance : LokiClient;

    constructor(instance: LokiClient, labels?: Record<string, string>) {
        super();

        this.instance = instance;
        this.labels = labels || {};
    }

    async write(message: string | LogMessage, labels?: Record<string, string>): Promise<void> {
        const stream : LokiDistributorPushStream = {
            stream: {
                ...this.labels,
                ...(labels || {}),
            },
            values: [],
        };

        if (typeof message === 'string') {
            stream.values.push([nanoSeconds(), message]);
        } else if (message.labels) {
            stream.values.push([message.time, message.message, message.labels]);
        } else {
            stream.values.push([message.time, message.message]);
        }

        await this.instance.distributor.push(stream);
    }

    async delete(options: LogStoreDeleteOptions): Promise<void> {
        await this.instance.compactor.createDeletionRequest({
            start: options.start,
            ...(options.end ? { end: options.end } : {}),
            query: this.buildQuery({
                ...this.labels,
                ...(options.labels || {}),
            }),
        });
    }

    async query(input: LogStoreQueryOptions): Promise<[LogMessage[], number]> {
        const options : LokiQuerierQueryRangeOptions = {
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

        const output : LogMessage[] = [];

        const response = await this.instance.querier.queryRange(options);
        if (response.data.resultType === 'streams') {
            for (let i = 0; i < response.data.result.length; i++) {
                const set = response.data.result[i];

                for (let j = 0; j < set.value.length; j++) {
                    output.push({
                        time: BigInt(set.value[j][0]),
                        message: set.value[j][1],
                    } satisfies LogMessage);
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
