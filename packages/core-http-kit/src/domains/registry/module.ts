/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties  } from '../../utils';
import type { Registry } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';
import type { IRegistryAPI, RegistryCreatePayload, RegistryUpdatePayload  } from './types';

export class RegistryAPI extends BaseAPI implements IRegistryAPI {
    async getMany(options?: EntityQueryInput<Registry>): Promise<EntityCollectionResponse<Registry>> {
        const response = await this.client.get(`registries${buildQueryString(options)}`);

        return response.data;
    }

    async getOne(id: Registry['id'], options?: EntityQueryInput<Registry>): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.get(`registries/${id}${buildQueryString(options)}`);

        return response.data;
    }

    async create(data: RegistryCreatePayload): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.post('registries', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: Registry['id'], data: RegistryUpdatePayload): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.post(`registries/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Registry['id']): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.delete(`registries/${id}`);

        return response.data;
    }
}
