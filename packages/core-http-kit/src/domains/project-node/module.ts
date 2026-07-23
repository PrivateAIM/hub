/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties  } from '../../utils';
import type { ProjectNode } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { ProjectNodeCreatePayload, ProjectNodeUpdatePayload } from './types';

export class ProjectNodeAPI extends BaseAPI {
    async getMany(data?: EntityQueryInput<ProjectNode>): Promise<CollectionResourceResponse<ProjectNode>> {
        const response = await this.client.get(`project-nodes${buildQueryString(data)}`);

        return response.data;
    }

    async getOne(id: ProjectNode['id'], data?: EntityQueryInput<ProjectNode>): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.get(`project-nodes/${id}${buildQueryString(data)}`);

        return response.data;
    }

    async create(data: ProjectNodeCreatePayload): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.post('project-nodes', data);

        return response.data;
    }

    async update(id: ProjectNode['id'], data: ProjectNodeUpdatePayload): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.post(`project-nodes/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: ProjectNode['id']): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.delete(`project-nodes/${id}`);

        return response.data;
    }
}
