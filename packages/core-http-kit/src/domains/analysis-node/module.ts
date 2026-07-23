/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisNode } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { AnalysisNodeCreatePayload, AnalysisNodeUpdatePayload } from './types';

export class AnalysisNodeAPI extends BaseAPI {
    async getMany(options?: EntityQueryInput<AnalysisNode>): Promise<CollectionResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(`analysis-nodes${buildQueryString(options)}`);
        return response;
    }

    async getOne(id: AnalysisNode['id']): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(`analysis-nodes/${id}`);

        return response;
    }

    async delete(id: AnalysisNode['id']): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.delete(`analysis-nodes/${id}`);

        return response;
    }

    async update(id: AnalysisNode['id'], data: AnalysisNodeUpdatePayload): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.post(`analysis-nodes/${id}`, data);

        return response;
    }

    async create(data: AnalysisNodeCreatePayload): Promise<SingleResourceResponse<AnalysisNode>> {
        const { data: response } = await this.client.post('analysis-nodes', data);

        return response;
    }
}
