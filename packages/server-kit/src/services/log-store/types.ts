/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type LogStoreQueryOptions = {
    labels?: Record<string, string>
    start?: number,
    end?: number,
    sort?: 'DESC' | 'ASC',
    limit?: number
};

export type LogStoreDeleteOptions = {
    labels?: Record<string, string>
    start?: number,
    end?: number,
};

export type LogMessage = {
    time?: bigint,
    message: string,
    labels?: Record<string, string>
};

export interface LogStore {
    setLabels(labels: Record<string, string>): void;

    getLabels() : Record<string, string>;

    extendLabels(labels: Record<string, string>): void;

    write(message: string | LogMessage, labels?: Record<string, string>) : Promise<void>;

    query(options?: LogStoreQueryOptions) : Promise<[LogMessage[], number]>;

    delete(options?: LogStoreDeleteOptions) : Promise<void>;
}
