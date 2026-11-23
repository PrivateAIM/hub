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
import type { Bucket, BucketCreatePayload, IBucketAPI } from './types';
import { StorageBaseAPI } from '../base';
import type { BucketFile } from '../bucket-file';

export class BucketAPI extends StorageBaseAPI implements IBucketAPI {
    async getMany(record?: EntityQueryInput<Bucket>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Bucket>> {
        const response = await this.client.get(`buckets${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: Bucket['id'],
        record?: EntityQueryInput<Bucket>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Bucket>> {
        const response = await this.client.get(`buckets/${id}${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async create(data: BucketCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Bucket>> {
        const response = await this.client.post('buckets', nullifyEmptyObjectProperties(data), buildRequestConfig(options));

        return response.data;
    }

    async delete(id: Bucket['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Bucket>> {
        const response = await this.client.delete(`buckets/${id}`, buildRequestConfig(options));

        return response.data;
    }

    async clear(id: Bucket['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Bucket>> {
        const response = await this.client.post(`buckets/${id}/clear`, undefined, buildRequestConfig(options));

        return response.data;
    }

    async update(
        id: Bucket['id'],
        data: Partial<BucketCreatePayload>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Bucket>> {
        const response = await this.client.post(
            `buckets/${id}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async upload(
        id: Bucket['id'],
        formData: FormData,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<BucketFile>> {
        const response = await this.client.post(`buckets/${id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            // an upload streams its body; the timer would cut it off
            timeout: 0,
            ...buildRequestConfig(options),
        });

        return response.data;
    }

    getStreamPath(id: string): string {
        return `buckets/${id}/stream`;
    }

    getStreamURL(id: BucketFile['id']) : string {
        return this.resolveURL(this.getStreamPath(id));
    }

    async stream(id: Bucket['id'], options?: APIRequestOptions) : Promise<ReadableStream<any>> {
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
