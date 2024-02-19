/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { AnalysisLog } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisLogAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisLog>): Promise<CollectionResourceResponse<AnalysisLog>> {
        const { data: response } = await this.client.get(`analysis-logs${buildQuery(options)}`);
        return response;
    }

    async getOne(id: AnalysisLog['id']): Promise<SingleResourceResponse<AnalysisLog>> {
        const { data: response } = await this.client.get(`analysis-logs/${id}`);

        return response;
    }

    async delete(id: AnalysisLog['id']): Promise<SingleResourceResponse<AnalysisLog>> {
        const { data: response } = await this.client.delete(`analysis-logs/${id}`);

        return response;
    }

    async update(id: AnalysisLog['id'], data: Partial<AnalysisLog>): Promise<SingleResourceResponse<AnalysisLog>> {
        const { data: response } = await this.client.post(`analysis-logs/${id}`, data);

        return response;
    }

    async create(data: Partial<AnalysisLog>): Promise<SingleResourceResponse<AnalysisLog>> {
        const { data: response } = await this.client.post('analysis-logs', data);

        return response;
    }
}
