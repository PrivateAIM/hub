/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type { Registry } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IRegistryAPI, RegistryCreatePayload, RegistryUpdatePayload } from './types';

export class RegistryAPI extends BaseAPI implements IRegistryAPI {
    async getMany(record?: EntityQueryInput<Registry>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Registry>> {
        const response = await this.client.get(`registries${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: Registry['id'],
        record?: EntityQueryInput<Registry>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.get(`registries/${id}${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async create(data: RegistryCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.post('registries', nullifyEmptyObjectProperties(data), buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: Registry['id'],
        data: RegistryUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.post(
            `registries/${id}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(id: Registry['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Registry>> {
        const response = await this.client.delete(`registries/${id}`, buildRequestConfig(options));

        return response.data;
    }
}
