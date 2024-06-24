/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisPermission } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisPermissionAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisPermission>): Promise<CollectionResourceResponse<AnalysisPermission>> {
        const { data: response } = await this.client.get(`analysis-permissions${buildQuery(options)}`);
        return response;
    }

    async getOne(id: AnalysisPermission['id']): Promise<SingleResourceResponse<AnalysisPermission>> {
        const { data: response } = await this.client.get(`analysis-permissions/${id}`);

        return response;
    }

    async delete(id: AnalysisPermission['id']): Promise<SingleResourceResponse<AnalysisPermission>> {
        const { data: response } = await this.client.delete(`analysis-permissions/${id}`);

        return response;
    }

    async update(id: AnalysisPermission['id'], data: Partial<AnalysisPermission>): Promise<SingleResourceResponse<AnalysisPermission>> {
        const { data: response } = await this.client.post(`analysis-permissions/${id}`, data);

        return response;
    }

    async create(data: Partial<AnalysisPermission>): Promise<SingleResourceResponse<AnalysisPermission>> {
        const { data: response } = await this.client.post('analysis-permissions', data);

        return response;
    }
}
