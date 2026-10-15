/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from '@privateaim/telemetry-kit';
import type { ActorContext } from '@privateaim/server-kit';
import type { LogStore } from '../log-store/types.ts';

export type LogServiceContext = {
    store: LogStore,
};

export type LogServiceGetManyResult = {
    data: Log[],
    meta: {
        total: number,
        limit: number,
        offset: number,
    },
};

export interface ILogService {
    create(data: LogInput, actor: ActorContext): Promise<Log>;
    getMany(query: unknown, actor: ActorContext): Promise<LogServiceGetManyResult>;
    deleteMany(query: unknown, actor: ActorContext): Promise<void>;
}
