/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core/src';
import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { nullifyEmptyObjectProperties } from '@privateaim/core';
import type { CollectionResourceResponse, SingleResourceResponse } from '@privateaim/core';
import { BaseAPI } from '../base';
import type { BucketFile } from '../bucket-file';
import type { Bucket } from './entity';

export class BucketAPI extends BaseAPI {
    async getMany(record?: BuildInput<Bucket>): Promise<CollectionResourceResponse<Bucket>> {
        const response = await this.client.get(`buckets${buildQuery(record)}`);
        return response.data;
    }

    async getOne(id: Bucket['id'], requestRecord?: BuildInput<Bucket>): Promise<SingleResourceResponse<Bucket>> {
        const response = await this.client.get(`buckets/${id}${buildQuery(requestRecord)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Bucket>> {
        const response = await this.client.post('buckets', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Bucket['id']): Promise<SingleResourceResponse<Bucket>> {
        const response = await this.client.delete(`buckets/${id}`);
        return response.data;
    }

    async update(id: Bucket['id'], data: Record<string, any>): Promise<SingleResourceResponse<Bucket>> {
        const response = await this.client.post(`buckets/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }

    async upload(id: Bucket['id'], formData: FormData): Promise<CollectionResourceResponse<BucketFile>> {
        const response = await this.client.post(`buckets/${id}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    getStreamPath(id: Analysis['id']): string {
        return `buckets/${id}/stream`;
    }

    async stream(id: Bucket['id']) : Promise<ReadableStream<any>> {
        const response = await this.client.request({
            url: this.getStreamPath(id),
            responseType: 'stream',
        });

        return response.data;
    }
}
