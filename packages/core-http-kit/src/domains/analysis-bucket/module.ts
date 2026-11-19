/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisBucket } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { AnalysisBucketCreatePayload, IAnalysisBucketAPI } from './types';

export class AnalysisBucketAPI extends BaseAPI implements IAnalysisBucketAPI {
    async getMany(
        record?: EntityQueryInput<AnalysisBucket>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<AnalysisBucket>> {
        const response = await this.client.get(
            `analysis-buckets${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async getOne(
        id: AnalysisBucket['id'],
        record?: EntityQueryInput<AnalysisBucket>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucket>> {
        const response = await this.client.get(
            `analysis-buckets/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async create(
        data: AnalysisBucketCreatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucket>> {
        const { data: response } = await this.client.post('analysis-buckets', data, buildRequestConfig(options));

        return response;
    }

    async delete(
        id: AnalysisBucket['id'],
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucket>> {
        const response = await this.client.delete(`analysis-buckets/${id}`, buildRequestConfig(options));

        return response.data;
    }
}
