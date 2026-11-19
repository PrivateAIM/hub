/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type { RegistryProject } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IRegistryProjectAPI, RegistryProjectCreatePayload, RegistryProjectUpdatePayload } from './types';

export class RegistryProjectAPI extends BaseAPI implements IRegistryProjectAPI {
    async getMany(
        record?: EntityQueryInput<RegistryProject>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<RegistryProject>> {
        const response = await this.client.get(`registry-projects${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: RegistryProject['id'],
        record?: EntityQueryInput<RegistryProject>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const response = await this.client.get(
            `registry-projects/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async create(
        data: RegistryProjectCreatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const response = await this.client.post(
            'registry-projects',
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async update(
        id: RegistryProject['id'],
        data: RegistryProjectUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<RegistryProject>> {
        const response = await this.client.post(
            `registry-projects/${id}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(id: RegistryProject['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<RegistryProject>> {
        const response = await this.client.delete(`registry-projects/${id}`, buildRequestConfig(options));

        return response.data;
    }
}
