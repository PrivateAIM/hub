/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { MasterImageGroup } from '@privateaim/core-kit';
import { BaseAPI } from '../base';

import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';

export class MasterImageGroupAPI extends BaseAPI {
    async getMany(data?: EntityQueryInput<MasterImageGroup>): Promise<EntityCollectionResponse<MasterImageGroup>> {
        const response = await this.client.get(`master-image-groups${buildQueryString(data)}`);
        return response.data;
    }

    async getOne(id: MasterImageGroup['id']): Promise<EntityRecordResponse<MasterImageGroup>> {
        const response = await this.client.get(`master-image-groups/${id}`);
        return response.data;
    }

    async delete(
        id: MasterImageGroup['id'],
    ): Promise<EntityRecordResponse<MasterImageGroup>> {
        const response = await this.client.delete(`master-image-groups/${id}`);

        return response.data;
    }
}
