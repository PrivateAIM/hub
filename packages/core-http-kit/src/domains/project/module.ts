/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties  } from '../../utils';
import type { Project } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { ProjectCreatePayload, ProjectUpdatePayload } from './types';

export class ProjectAPI extends BaseAPI {
    async getMany(record?: EntityQueryInput<Project>): Promise<CollectionResourceResponse<Project>> {
        const response = await this.client.get(`projects${buildQueryString(record)}`);
        return response.data;
    }

    async getOne(id: Project['id'], requestRecord?: EntityQueryInput<Project>): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.get(`projects/${id}${buildQueryString(requestRecord)}`);

        return response.data;
    }

    async create(data: ProjectCreatePayload): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.post('projects', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Project['id']): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.delete(`projects/${id}`);
        return response.data;
    }

    async update(id: Project['id'], data: ProjectUpdatePayload): Promise<SingleResourceResponse<Project>> {
        const response = await this.client.post(`projects/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }
}
