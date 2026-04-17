/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from '@privateaim/telemetry-kit';

export type LogStoreQueryOptions = {
    labels?: Record<string, string>,

    start?: number,
    end?: number,

    sort?: 'DESC' | 'ASC',

    limit?: number,
    offset?: number,
};

export type LogStoreDeleteOptions = {
    labels?: Record<string, string>
    start?: number,
    end?: number,
};

export interface LogStore {
    write(message: LogInput) : Promise<Log>;

    query(options?: LogStoreQueryOptions) : Promise<[Log[], number]>;

    delete(options?: LogStoreDeleteOptions) : Promise<void>;
}
