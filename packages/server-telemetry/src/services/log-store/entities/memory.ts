/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogLevel } from '@privateaim/telemetry-kit';
import { nanoSeconds } from '@hapic/loki';
import type {
    LogStore, LogStoreQueryOptions,
} from '../types';
import { BaseLogStore } from './base';

export class MemoryLogStore extends BaseLogStore implements LogStore {
    public readonly items : Log[];

    constructor(labels?: Record<string, string>) {
        super();

        this.items = [];
        this.labels = labels;
    }

    // todo: apply query options
    async delete(): Promise<void> {
        return Promise.resolve();
    }

    async query(options: LogStoreQueryOptions = {}): Promise<[Log[], number]> {
        // todo: apply all query options

        const data = this.items.filter((item) => {
            if (options.labels) {
                if (!item.labels) {
                    return false;
                }

                const labelKeys = Object.keys(options.labels);
                for (let i = 0; i < labelKeys.length; i++) {
                    if (!item.labels[labelKeys[i]]) {
                        return false;
                    }

                    if (item.labels[labelKeys[i]] !== options.labels[labelKeys[i]]) {
                        return false;
                    }
                }
            }

            return true;
        });

        return [
            data,
            data.length,
        ];
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

        this.items.push(data);

        return data;
    }
}
