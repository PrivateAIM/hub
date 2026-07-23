/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties  } from '../../utils';
import type { RegistryProject } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { RegistryProjectCreatePayload, RegistryProjectUpdatePayload } from './types';

export class RegistryProjectAPI extends BaseAPI {
    async getMany(options?: EntityQueryInput<RegistryProject>): Promise<CollectionResourceResponse<RegistryProject>> {
        const response = await this.client.get(`registry-projects${buildQueryString(options)}`);

        return response.data;
    }

    async getOne(id: RegistryProject['id'], options?: EntityQueryInput<RegistryProject>): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.get(`registry-projects/${id}${buildQueryString(options)}`);

        return response.data;
    }

    async create(data: RegistryProjectCreatePayload): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.post('registry-projects', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: RegistryProject['id'], data: RegistryProjectUpdatePayload): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.post(`registry-projects/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: RegistryProject['id']): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.delete(`registry-projects/${id}`);

        return response.data;
    }
}
