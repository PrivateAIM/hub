/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';

/** Read + delete only — groups appear through master-image catalog sync. */
export interface IMasterImageGroupAPI {
    getMany(
        record?: EntityQueryInput<MasterImageGroup>,
        options?: APIRequestOptions,
    ) : Promise<EntityCollectionResponse<MasterImageGroup>>;
    getOne(
        id: MasterImageGroup['id'],
        record?: EntityQueryInput<MasterImageGroup>,
        options?: APIRequestOptions,
    ) : Promise<EntityRecordResponse<MasterImageGroup>>;
    delete(id: MasterImageGroup['id'], options?: APIRequestOptions) : Promise<EntityRecordResponse<MasterImageGroup>>;
}
