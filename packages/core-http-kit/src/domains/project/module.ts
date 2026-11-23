/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type { Project } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IProjectAPI, ProjectCreatePayload, ProjectUpdatePayload } from './types';

export class ProjectAPI extends BaseAPI implements IProjectAPI {
    async getMany(record?: EntityQueryInput<Project>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Project>> {
        const response = await this.client.get(`projects${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: Project['id'],
        record?: EntityQueryInput<Project>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Project>> {
        const response = await this.client.get(`projects/${id}${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async create(data: ProjectCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Project>> {
        const response = await this.client.post('projects', nullifyEmptyObjectProperties(data), buildRequestConfig(options));

        return response.data;
    }

    async delete(id: Project['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Project>> {
        const response = await this.client.delete(`projects/${id}`, buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: Project['id'],
        data: ProjectUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Project>> {
        const response = await this.client.post(
            `projects/${id}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }
}
