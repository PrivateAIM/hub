/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { Event } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { BaseAPI } from '../base';

export class EventAPI extends BaseAPI {
    async getMany(options?: BuildInput<Event>): Promise<CollectionResourceResponse<Event>> {
        const { data: response } = await this.client.get(`events${buildQuery(options)}`);
        return response;
    }

    async getOne(id: Event['id']): Promise<SingleResourceResponse<Event>> {
        const { data: response } = await this.client.get(`events/${id}`);

        return response;
    }

    async delete(id: Event['id']): Promise<SingleResourceResponse<Event>> {
        const { data: response } = await this.client.delete(`events/${id}`);

        return response;
    }

    async update(id: Event['id'], data: Partial<Event>): Promise<SingleResourceResponse<Event>> {
        const { data: response } = await this.client.post(`events/${id}`, data);

        return response;
    }

    async create(data: Partial<Event>): Promise<SingleResourceResponse<Event>> {
        const { data: response } = await this.client.post('events', data);

        return response;
    }
}
