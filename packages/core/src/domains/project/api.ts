/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { Project } from './entity';
import { nullifyEmptyObjectProperties } from '../../utils';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class ProjectAPI extends BaseAPI {
    async getMany(record?: BuildInput<Project>): Promise<CollectionResourceResponse<Project>> {
        const response = await this.client.get(`projects${buildQuery(record)}`);
        return response.data;
    }

    async getOne(id: Project['id'], requestRecord?: BuildInput<Project>): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.get(`projects/${id}${buildQuery(requestRecord)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.post('projects', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Project['id']): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.delete(`projects/${id}`);
        return response.data;
    }

    async update(id: Project['id'], data: Record<string, any>): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.post(`projects/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }
}
