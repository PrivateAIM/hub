/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import { nullifyEmptyObjectProperties } from '@privateaim/kit';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { BucketFile, IBucketFileAPI } from './types';
import { StorageBaseAPI } from '../base';

export class BucketFileAPI extends StorageBaseAPI implements IBucketFileAPI {
    async getMany(
        record?: EntityQueryInput<BucketFile>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<BucketFile>> {
        const response = await this.client.get(`bucket-files${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: BucketFile['id'],
        record?: EntityQueryInput<BucketFile>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<BucketFile>> {
        const response = await this.client.get(
            `bucket-files/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async create(data: Record<string, any>, options?: APIRequestOptions): Promise<EntityRecordResponse<BucketFile>> {
        const response = await this.client.post('bucket-files', nullifyEmptyObjectProperties(data), buildRequestConfig(options));

        return response.data;
    }

    async delete(id: BucketFile['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<BucketFile>> {
        const response = await this.client.delete(`bucket-files/${id}`, buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: BucketFile['id'],
        data: Record<string, any>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<BucketFile>> {
        const response = await this.client.post(
            `bucket-files/${id}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    getStreamPath(id: BucketFile['id']): string {
        return `bucket-files/${id}/stream`;
    }

    getStreamURL(id: BucketFile['id']) : string {
        return this.resolveURL(this.getStreamPath(id));
    }

    async stream(id: BucketFile['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>> {
        const response = await this.client.request({
            url: this.getStreamPath(id),
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
