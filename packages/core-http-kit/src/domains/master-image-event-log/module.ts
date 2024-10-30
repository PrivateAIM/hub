/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { MasterImageEventLog } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class MasterImageEventLogAPI extends BaseAPI {
    async getMany(options?: BuildInput<MasterImageEventLog>): Promise<CollectionResourceResponse<MasterImageEventLog>> {
        const { data: response } = await this.client.get(`master-image-event-logs${buildQuery(options)}`);
        return response;
    }

    async getOne(id: MasterImageEventLog['id']): Promise<SingleResourceResponse<MasterImageEventLog>> {
        const { data: response } = await this.client.get(`master-image-event-logs/${id}`);

        return response;
    }

    async delete(id: MasterImageEventLog['id']): Promise<SingleResourceResponse<MasterImageEventLog>> {
        const { data: response } = await this.client.delete(`master-image-event-logs/${id}`);

        return response;
    }

    async update(id: MasterImageEventLog['id'], data: Partial<MasterImageEventLog>): Promise<SingleResourceResponse<MasterImageEventLog>> {
        const { data: response } = await this.client.post(`master-image-event-logs/${id}`, data);

        return response;
    }

    async create(data: Partial<MasterImageEventLog>): Promise<SingleResourceResponse<MasterImageEventLog>> {
        const { data: response } = await this.client.post('master-image-event-logs', data);

        return response;
    }
}
