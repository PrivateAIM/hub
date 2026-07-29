/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { Event } from './entity';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';
import type { IEventAPI } from './types';
import { BaseAPI } from '../base';

export class EventAPI extends BaseAPI implements IEventAPI {
    async getMany(options?: EntityQueryInput<Event>): Promise<EntityCollectionResponse<Event>> {
        const { data: response } = await this.client.get(`events${buildQueryString(options)}`);
        return response;
    }

    async getOne(id: Event['id']): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.get(`events/${id}`);

        return response;
    }

    async delete(id: Event['id']): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.delete(`events/${id}`);

        return response;
    }

    async update(id: Event['id'], data: Partial<Event>): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.post(`events/${id}`, data);

        return response;
    }

    async create(data: Partial<Event>): Promise<EntityRecordResponse<Event>> {
        const { data: response } = await this.client.post('events', data);

        return response;
    }
}
