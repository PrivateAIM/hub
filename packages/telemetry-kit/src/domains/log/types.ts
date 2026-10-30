/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types';
import type { LogChannel, LogLevel } from './constants';

/**
 * Cannot extend `IEntityAPI<Log>`: the log store is append-and-query only.
 * There is no `getOne`, no `update`, and no id-keyed `delete` — bulk removal
 * is a query-keyed `deleteMany` resolving to `void`.
 */
export interface ILogAPI {
    getMany(options?: EntityQueryInput<Log>) : Promise<EntityCollectionResponse<Log>>;
    deleteMany(options?: EntityQueryInput<Log>) : Promise<void>;
    create(data: LogInput) : Promise<EntityRecordResponse<Log>>;
}

// todo: update logger-transport on new top level log flags
export type Log = {
    /**
     * ISO String
     */
    time: string,

    /**
     *  message
     */
    message: string,

    /**
     * level
     */
    level: `${LogLevel}`,

    /**
     * service
     */
    service: string,

    /**
     * channel
     */
    channel: `${LogChannel}`,

    /**
     * additional labels
     */
    labels: Record<string, string>
};

type RequiredTypes = ('message' | 'level' | 'service' | 'channel');

export type LogInput = Pick<Log, RequiredTypes & keyof Log> & Partial<Omit<Log, RequiredTypes & keyof Log>>;
