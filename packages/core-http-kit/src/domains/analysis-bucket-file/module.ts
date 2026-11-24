/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { encodePathSegment } from '@authup/core-http-kit';
import type { AnalysisBucketFileCreatePayload, AnalysisBucketFileUpdatePayload, IAnalysisBucketFileAPI } from './types';

export class AnalysisBucketFileAPI extends BaseAPI implements IAnalysisBucketFileAPI {
    async getMany(
        record?: EntityQueryInput<AnalysisBucketFile>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<AnalysisBucketFile>> {
        const response = await this.client.get(
            `analysis-bucket-files${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async getOne(
        id: AnalysisBucketFile['id'],
        record?: EntityQueryInput<AnalysisBucketFile>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const response = await this.client.get(
            `analysis-bucket-files/${encodePathSegment(id)}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(
        id: AnalysisBucketFile['id'],
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const response = await this.client.delete(`analysis-bucket-files/${encodePathSegment(id)}`, buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: AnalysisBucketFile['id'],
        data: AnalysisBucketFileUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const { data: response } = await this.client.post(
            `analysis-bucket-files/${encodePathSegment(id)}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response;
    }

    async create(
        data: AnalysisBucketFileCreatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const { data: response } = await this.client.post(
            'analysis-bucket-files',
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response;
    }
}
