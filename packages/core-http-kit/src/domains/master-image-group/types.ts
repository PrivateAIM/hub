/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';

/** Read + delete only — groups appear through master-image catalog sync. */
export interface IMasterImageGroupAPI {
    getMany(data?: EntityQueryInput<MasterImageGroup>) : Promise<EntityCollectionResponse<MasterImageGroup>>;
    getOne(id: MasterImageGroup['id']) : Promise<EntityRecordResponse<MasterImageGroup>>;
    delete(id: MasterImageGroup['id']) : Promise<EntityRecordResponse<MasterImageGroup>>;
}
