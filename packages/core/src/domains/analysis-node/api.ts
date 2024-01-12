/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { AnalysisNode } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class TrainStationAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisNode>): Promise<CollectionResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(`train-stations${buildQuery(options)}`);
        return response;
    }

    async getOne(id: AnalysisNode['id']): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(`train-stations/${id}`);

        return response;
    }

    async delete(id: AnalysisNode['id']): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.delete(`train-stations/${id}`);

        return response;
    }

    async update(id: AnalysisNode['id'], data: Partial<AnalysisNode>): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.post(`train-stations/${id}`, data);

        return response;
    }

    async create(data: Partial<AnalysisNode>): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.post('train-stations', data);

        return response;
    }
}
