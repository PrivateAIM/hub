/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { Event, IEventAPI } from './types';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { BaseAPI } from 'hapic';

export class EventAPI extends BaseAPI implements IEventAPI {
    async getMany(record?: EntityQueryInput<Event>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Event>> {
        const { data: response } = await this.client.get(`events${buildQueryString(record)}`, buildRequestConfig(options));

        return response;
    }

    async getOne(
        id: Event['id'],
        record?: EntityQueryInput<Event>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.get(
            `events/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async delete(id: Event['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.delete(`events/${id}`, buildRequestConfig(options));

        return response;
    }

    async create(data: Partial<Event>, options?: APIRequestOptions): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.post('events', data, buildRequestConfig(options));

        return response;
    }
}
