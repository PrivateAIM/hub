/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { nullifyEmptyObjectProperties } from '../../utils';
import { BaseAPI } from '../base';
import type { ProjectNode } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class ProjectNodeAPI extends BaseAPI {
    async getMany(data?: BuildInput<ProjectNode>): Promise<CollectionResourceResponse<ProjectNode>> {
        const response = await this.client.get(`project-nodes${buildQuery(data)}`);

        return response.data;
    }

    async getOne(id: ProjectNode['id'], data?: BuildInput<ProjectNode>): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.get(`project-nodes/${id}${buildQuery(data)}`);

        return response.data;
    }

    async create(data: Partial<ProjectNode>): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.post('project-nodes', data);

        return response.data;
    }

    async update(id: ProjectNode['id'], data: Partial<ProjectNode>): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.post(`project-nodes/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: ProjectNode['id']): Promise<SingleResourceResponse<ProjectNode>> {
        const response = await this.client.delete(`project-nodes/${id}`);

        return response.data;
    }
}
