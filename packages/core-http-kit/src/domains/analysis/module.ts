/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type {
    Analysis,
    AnalysisCommand,
    AnalysisStorageToken,
    AnalysisStorageTokenCreatePayload,
} from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { encodePathSegment } from '@authup/core-http-kit';
import type { AnalysisCreatePayload, AnalysisUpdatePayload, IAnalysisAPI } from './types';

export class AnalysisAPI extends BaseAPI implements IAnalysisAPI {
    getResultDownloadPath(id: Analysis['id']): string {
        return `analyses/${encodePathSegment(id)}/result/download`;
    }

    getFilesDownloadPath(id: Analysis['id']): string {
        return `analyses/${encodePathSegment(id)}/files/download`;
    }

    async getMany(
        record?: EntityQueryInput<Analysis>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<Analysis>> {
        const { data: response } = await this.client.get(
            `analyses${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async getOne(
        id: Analysis['id'],
        record?: EntityQueryInput<Analysis>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Analysis>> {
        const { data: response } = await this.client.get(
            `analyses/${encodePathSegment(id)}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async delete(id: Analysis['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Analysis>> {
        const { data: response } = await this.client.delete(`analyses/${encodePathSegment(id)}`, buildRequestConfig(options));

        return response;
    }

    async update(
        id: Analysis['id'],
        data: AnalysisUpdatePayload,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Analysis>> {
        const { data: response } = await this.client.post(
            `analyses/${encodePathSegment(id)}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response;
    }

    async create(data: AnalysisCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Analysis>> {
        const { data: response } = await this.client.post(
            'analyses',
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response;
    }

    async runCommand(
        id: Analysis['id'],
        command: `${AnalysisCommand}`,
        data: Record<string, any> = {},
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Analysis>> {
        const { data: response } = await this.client.post(
            `analyses/${encodePathSegment(id)}/command`,
            {
                command,
                ...data,
            },
            buildRequestConfig(options),
        );

        return response;
    }

    async createStorageToken(
        id: Analysis['id'],
        data: AnalysisStorageTokenCreatePayload,
        options?: APIRequestOptions,
    ): Promise<AnalysisStorageToken> {
        const { data: response } = await this.client.post(
            `analyses/${encodePathSegment(id)}/storage/token`,
            data,
            buildRequestConfig(options),
        );

        return response;
    }

    async streamFiles(id: Analysis['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>> {
        const response = await this.client.get(this.getFilesDownloadPath(id), {
            responseType: 'stream',
            // the timer would keep running while the body is read
            timeout: 0,
            ...buildRequestConfig(options),
        });

        if (typeof response.data === 'undefined') {
            throw new Error('The stream response did not return a body.');
        }

        return response.data;
    }

    async downloadResult(id: Analysis['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>> {
        const response = await this.client.get(this.getResultDownloadPath(id), {
            responseType: 'stream',
            // the timer would keep running while the body is read
            timeout: 0,
            ...buildRequestConfig(options),
        });

        if (typeof response.data === 'undefined') {
            throw new Error('The stream response did not return a body.');
        }

        return response.data;
    }
}
