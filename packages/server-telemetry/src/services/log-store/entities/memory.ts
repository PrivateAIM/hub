/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { normalizeLogInput } from '@privateaim/telemetry-kit';
import type {
    LogStore, LogStoreQueryOptions,
} from '../types.ts';

export class MemoryLogStore implements LogStore {
    public readonly items : Log[];

    constructor() {
        this.items = [];
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

    async write(message: LogInput): Promise<Log> {
        const output = normalizeLogInput(message);

        this.items.push(output);

        return output;
    }
}
