/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { Node } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { nullifyEmptyObjectProperties } from '../../utils';

export class NodeAPI extends BaseAPI {
    async getMany(options?: BuildInput<Node>): Promise<CollectionResourceResponse<Node>> {
        const response = await this.client.get(`nodes${buildQuery(options)}`);

        return response.data;
    }

    async getOne(id: Node['id'], options?: BuildInput<Node>): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.get(`nodes/${id}${buildQuery(options)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.post('nodes', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: Node['id'], data: Record<string, any>): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.post(`nodes/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Node['id']): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.delete(`nodes/${id}`);

        return response.data;
    }

    async runCommand(id: Node['id'], task: string, data: Record<string, any>): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.post(`nodes/${id}/task`, { task, ...data });

        return response.data;
    }
}
