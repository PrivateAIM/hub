/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    LogMessage, LogStore, LogStoreQueryOptions,
} from '../types';
import { nanoSeconds } from '../../loki';

export class MemoryLogStore implements LogStore {
    public readonly items : LogMessage[];

    public readonly labels : Record<string, string>;

    constructor(labels?: Record<string, string>) {
        this.items = [];
        this.labels = labels;
    }

    // todo: apply query options
    async delete(): Promise<void> {
        return Promise.resolve();
    }

    async query(options: LogStoreQueryOptions = {}): Promise<[LogMessage[], number]> {
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

        return [data, data.length];
    }

    write(message: string | LogMessage, labels?: Record<string, string>): Promise<void> {
        if (typeof message === 'string') {
            this.items.push({ message, time: nanoSeconds(), ...(labels ? { labels } : {}) });
            return Promise.resolve();
        }

        const data : Record<string, string> = {
            ...this.labels,
            ...(labels || {}),
            ...(message.labels ? message.labels : {}),
        };

        this.items.push({
            message: message.message,
            time: message.time || nanoSeconds(),
            ...(data ? { labels: data } : {}),
        });

        return Promise.resolve();
    }
}
