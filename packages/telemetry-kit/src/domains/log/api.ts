/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { ILogAPI, Log, LogInput } from './types';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { BaseAPI } from 'hapic';

export class LogAPI extends BaseAPI implements ILogAPI {
    async getMany(record?: EntityQueryInput<Log>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Log>> {
        const { data: response } = await this.client.get(`logs${buildQueryString(record)}`, buildRequestConfig(options));

        return response;
    }

    async deleteMany(record?: EntityQueryInput<Log>, options?: APIRequestOptions): Promise<void> {
        await this.client.delete(`logs${buildQueryString(record)}`, buildRequestConfig(options));
    }

    async create(data: LogInput, options?: APIRequestOptions): Promise<EntityRecordResponse<Log>> {
        const { data: response } = await this.client.post('logs', data, buildRequestConfig(options));

        return response;
    }
}
