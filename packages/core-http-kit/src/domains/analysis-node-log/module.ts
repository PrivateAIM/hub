/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisNodeLogAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisNodeLog>): Promise<CollectionResourceResponse<AnalysisNodeLog>> {
        const { data: response } = await this.client.get(`analysis-node-logs${buildQuery(options)}`);
        return response;
    }

    async getOne(id: AnalysisNodeLog['id']): Promise<SingleResourceResponse<AnalysisNodeLog>> {
        const { data: response } = await this.client.get(`analysis-node-logs/${id}`);

        return response;
    }

    async delete(id: AnalysisNodeLog['id']): Promise<SingleResourceResponse<AnalysisNodeLog>> {
        const { data: response } = await this.client.delete(`analysis-node-logs/${id}`);

        return response;
    }

    async update(id: AnalysisNodeLog['id'], data: Partial<AnalysisNodeLog>): Promise<SingleResourceResponse<AnalysisNodeLog>> {
        const { data: response } = await this.client.post(`analysis-node-logs/${id}`, data);

        return response;
    }

    async create(data: Partial<AnalysisNodeLog>): Promise<SingleResourceResponse<AnalysisNodeLog>> {
        const { data: response } = await this.client.post('analysis-node-logs', data);

        return response;
    }
}
