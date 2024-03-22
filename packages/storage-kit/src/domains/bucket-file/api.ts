/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { nullifyEmptyObjectProperties } from '@privateaim/core';
import type { CollectionResourceResponse, SingleResourceResponse } from '@privateaim/core';
import type { BucketFile } from './entity';
import { BaseAPI } from '../base';

export class BucketFileAPI extends BaseAPI {
    async getMany(record?: BuildInput<BucketFile>): Promise<CollectionResourceResponse<BucketFile>> {
        const response = await this.client.get(`bucket-files${buildQuery(record)}`);
        return response.data;
    }

    async getOne(id: BucketFile['id'], requestRecord?: BuildInput<BucketFile>): Promise<SingleResourceResponse<BucketFile>> {
        const response = await this.client.get(`bucket-files/${id}${buildQuery(requestRecord)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<BucketFile>> {
        const response = await this.client.post('bucket-files', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: BucketFile['id']): Promise<SingleResourceResponse<BucketFile>> {
        const response = await this.client.delete(`bucket-files/${id}`);
        return response.data;
    }

    async update(id: BucketFile['id'], data: Record<string, any>): Promise<SingleResourceResponse<BucketFile>> {
        const response = await this.client.post(`bucket-files/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }

    getStreamPath(id: BucketFile['id']): string {
        return `bucket-files/${id}/stream`;
    }

    getStreamURL(id: BucketFile['id']) : string {
        return new URL(this.getStreamPath(id), this.client.getBaseURL()).href;
    }

    async stream(id: BucketFile['id']) : Promise<ReadableStream<any>> {
        const response = await this.client.request({
            url: this.getStreamPath(id),
            responseType: 'stream',
        });

        return response.data;
    }
}
