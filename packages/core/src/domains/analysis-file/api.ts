/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { nullifyEmptyObjectProperties } from '../../utils';
import { BaseAPI } from '../base';
import type { AnalysisFile } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisFileAPI extends BaseAPI {
    async getMany(
        options?: BuildInput<AnalysisFile>,
    ): Promise<CollectionResourceResponse<AnalysisFile>> {
        const response = await this.client.get(`analysis-files${buildQuery(options)}`);

        return response.data;
    }

    async getOne(
        id: AnalysisFile['id'],
    ): Promise<SingleResourceResponse<AnalysisFile>> {
        const response = await this.client.get(`analysis-files/${id}`);

        return response.data;
    }

    async delete(
        id: AnalysisFile['id'],
    ): Promise<SingleResourceResponse<AnalysisFile>> {
        const response = await this.client.delete(`analysis-files/${id}`);

        return response.data;
    }

    async update(id: AnalysisFile['id'], data: Partial<AnalysisFile>): Promise<SingleResourceResponse<AnalysisFile>> {
        const { data: response } = await this.client.post(`analysis-files/${id}`, nullifyEmptyObjectProperties(data));

        return response;
    }

    async create(data: Partial<AnalysisFile>): Promise<SingleResourceResponse<AnalysisFile>> {
        const { data: response } = await this.client.post('analysis-files', nullifyEmptyObjectProperties(data));

        return response;
    }
}
