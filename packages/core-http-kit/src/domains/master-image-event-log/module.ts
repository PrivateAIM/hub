/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { MasterImageEvent } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class MasterImageEventLogAPI extends BaseAPI {
    async getMany(options?: BuildInput<MasterImageEvent>): Promise<CollectionResourceResponse<MasterImageEvent>> {
        const { data: response } = await this.client.get(`master-image-event-logs${buildQuery(options)}`);
        return response;
    }

    async getOne(id: MasterImageEvent['id']): Promise<SingleResourceResponse<MasterImageEvent>> {
        const { data: response } = await this.client.get(`master-image-event-logs/${id}`);

        return response;
    }

    async delete(id: MasterImageEvent['id']): Promise<SingleResourceResponse<MasterImageEvent>> {
        const { data: response } = await this.client.delete(`master-image-event-logs/${id}`);

        return response;
    }

    async update(id: MasterImageEvent['id'], data: Partial<MasterImageEvent>): Promise<SingleResourceResponse<MasterImageEvent>> {
        const { data: response } = await this.client.post(`master-image-event-logs/${id}`, data);

        return response;
    }

    async create(data: Partial<MasterImageEvent>): Promise<SingleResourceResponse<MasterImageEvent>> {
        const { data: response } = await this.client.post('master-image-event-logs', data);

        return response;
    }
}
