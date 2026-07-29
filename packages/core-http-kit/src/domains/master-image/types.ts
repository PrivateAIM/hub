/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';

/**
 * Cannot extend `IEntityAPISlim`: master images are created by the catalog
 * synchronizer (the `SYNC` command), never by a `create` call.
 */
export interface IMasterImageAPI {
    getMany(data?: EntityQueryInput<MasterImage>) : Promise<EntityCollectionResponse<MasterImage>>;
    getOne(id: MasterImage['id'], data?: EntityQueryInput<MasterImage>) : Promise<EntityRecordResponse<MasterImage>>;
    delete(id: MasterImage['id']) : Promise<EntityRecordResponse<MasterImage>>;

    /**
     * `BUILD` echoes the affected master image back; `SYNC` has no single
     * record to return — hence the `null` branch.
     */
    runCommand(
        command: `${MasterImageCommand}`,
        data?: Record<string, any>,
    ) : Promise<EntityRecordResponse<MasterImage | null>>;
}
