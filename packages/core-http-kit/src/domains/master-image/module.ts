/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class MasterImageAPI extends BaseAPI {
    async getMany(data?: EntityQueryInput<MasterImage>): Promise<CollectionResourceResponse<MasterImage>> {
        const response = await this.client.get(`master-images${buildQueryString(data)}`);
        return response.data;
    }

    async getOne(
        id: MasterImage['id'],
        data?: EntityQueryInput<MasterImage>,
    ): Promise<SingleResourceResponse<MasterImage>> {
        const response = await this.client.get(`master-images/${id}${buildQueryString(data)}`);
        return response.data;
    }

    async delete(id: MasterImage['id']): Promise<SingleResourceResponse<MasterImage>> {
        const response = await this.client.delete(`master-images/${id}`);
        return response.data;
    }

    async runCommand(
        command: `${MasterImageCommand}`,
        data: Record<string, any> = {},
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        const actionData = {
            command,
            ...data,
        };

        const { data: response } = await this.client.post('master-images/command', actionData);

        return response;
    }
}
