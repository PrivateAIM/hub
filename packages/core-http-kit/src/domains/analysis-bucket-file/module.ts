/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { nullifyEmptyObjectProperties } from '../../utils';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisBucketFileAPI extends BaseAPI {
    async getMany(
        options?: BuildInput<AnalysisBucketFile>,
    ): Promise<CollectionResourceResponse<AnalysisBucketFile>> {
        const response = await this.client.get(`analysis-bucket-files${buildQuery(options)}`);

        return response.data;
    }

    async getOne(
        id: AnalysisBucketFile['id'],
    ): Promise<SingleResourceResponse<AnalysisBucketFile>> {
        const response = await this.client.get(`analysis-bucket-files/${id}`);

        return response.data;
    }

    async delete(
        id: AnalysisBucketFile['id'],
    ): Promise<SingleResourceResponse<AnalysisBucketFile>> {
        const response = await this.client.delete(`analysis-bucket-files/${id}`);

        return response.data;
    }

    async update(id: AnalysisBucketFile['id'], data: Partial<AnalysisBucketFile>): Promise<SingleResourceResponse<AnalysisBucketFile>> {
        const { data: response } = await this.client.post(`analysis-bucket-files/${id}`, nullifyEmptyObjectProperties(data));

        return response;
    }

    async create(data: Partial<AnalysisBucketFile>): Promise<SingleResourceResponse<AnalysisBucketFile>> {
        const { data: response } = await this.client.post('analysis-bucket-files', nullifyEmptyObjectProperties(data));

        return response;
    }
}
