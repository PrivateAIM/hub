/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisBucket } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { AnalysisBucketCreatePayload } from './types';

export class AnalysisBucketAPI extends BaseAPI {
    async getMany(
        options?: EntityQueryInput<AnalysisBucket>,
    ): Promise<CollectionResourceResponse<AnalysisBucket>> {
        const response = await this.client.get(`analysis-buckets${buildQueryString(options)}`);

        return response.data;
    }

    async getOne(
        id: AnalysisBucket['id'],
    ): Promise<SingleResourceResponse<AnalysisBucket>> {
        const response = await this.client.get(`analysis-buckets/${id}`);

        return response.data;
    }

    async create(data: AnalysisBucketCreatePayload): Promise<SingleResourceResponse<AnalysisBucket>> {
        const { data: response } = await this.client.post('analysis-buckets', data);

        return response;
    }

    async delete(
        id: AnalysisBucket['id'],
    ): Promise<SingleResourceResponse<AnalysisBucket>> {
        const response = await this.client.delete(`analysis-buckets/${id}`);

        return response.data;
    }
}
