/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisNode } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { AnalysisNodeCreatePayload, AnalysisNodeUpdatePayload, IAnalysisNodeAPI } from './types';

export class AnalysisNodeAPI extends BaseAPI implements IAnalysisNodeAPI {
    async getMany(
        record?: EntityQueryInput<AnalysisNode>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(
            `analysis-nodes${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async getOne(
        id: AnalysisNode['id'],
        record?: EntityQueryInput<AnalysisNode>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const { data: response } = await this.client.get(
            `analysis-nodes/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async delete(id: AnalysisNode['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<AnalysisNode>> {
        const { data: response } = await this.client.delete(`analysis-nodes/${id}`, buildRequestConfig(options));

        return response;
    }

    async update(
        id: AnalysisNode['id'],
        data: AnalysisNodeUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const { data: response } = await this.client.post(`analysis-nodes/${id}`, data, buildRequestConfig(options));

        return response;
    }

    async create(
        data: AnalysisNodeCreatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const { data: response } = await this.client.post('analysis-nodes', data, buildRequestConfig(options));

        return response;
    }
}
