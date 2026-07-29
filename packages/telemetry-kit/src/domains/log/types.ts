/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';
import type { Log, LogInput } from './entity';

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
