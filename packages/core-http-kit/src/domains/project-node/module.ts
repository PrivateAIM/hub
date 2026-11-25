/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type { ProjectNode } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { encodePathSegment } from '@authup/core-http-kit';
import type { IProjectNodeAPI, ProjectNodeCreatePayload, ProjectNodeUpdatePayload } from './types';

export class ProjectNodeAPI extends BaseAPI implements IProjectNodeAPI {
    async getMany(
        record?: EntityQueryInput<ProjectNode>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<ProjectNode>> {
        const response = await this.client.get(`project-nodes${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: ProjectNode['id'],
        record?: EntityQueryInput<ProjectNode>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const response = await this.client.get(
            `project-nodes/${encodePathSegment(id)}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async create(data: ProjectNodeCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<ProjectNode>> {
        const response = await this.client.post('project-nodes', data, buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: ProjectNode['id'],
        data: ProjectNodeUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const response = await this.client.post(
            `project-nodes/${encodePathSegment(id)}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(id: ProjectNode['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<ProjectNode>> {
        const response = await this.client.delete(`project-nodes/${encodePathSegment(id)}`, buildRequestConfig(options));

        return response.data;
    }
}
