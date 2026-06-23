/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { Node } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { nullifyEmptyObjectProperties } from '../../utils';
import type {
    NodeClientCredentials,
    NodeClientCredentialsUpdate,
    NodeCreatePayload,
    NodeRegistryCredentials,
    NodeUpdatePayload,
} from './types';

export class NodeAPI extends BaseAPI {
    async getMany(options?: BuildInput<Node>): Promise<CollectionResourceResponse<Node>> {
        const response = await this.client.get(`nodes${buildQuery(options)}`);

        return response.data;
    }

    async getOne(id: Node['id'], options?: BuildInput<Node>): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.get(`nodes/${id}${buildQuery(options)}`);

        return response.data;
    }

    async create(data: NodeCreatePayload): Promise<SingleResourceResponse<Node>> {
        const response = await this.client.post('nodes', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: Node['id'], data: NodeUpdatePayload): Promise<SingleResourceResponse<Node>> {
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

    async getClientCredentials(id: Node['id']): Promise<NodeClientCredentials> {
        const response = await this.client.get(`nodes/${id}/client/credentials`);

        return response.data;
    }

    /**
     * Update the node client's credentials. An omitted `secret` rotates to a
     * fresh one; an omitted `name` / `display_name` leaves that field unchanged.
     * Returns the new credentials once.
     */
    async setClientCredentials(id: Node['id'], data?: NodeClientCredentialsUpdate): Promise<NodeClientCredentials> {
        const response = await this.client.post(`nodes/${id}/client/credentials`, data ?? {});

        return response.data;
    }

    /**
     * Read the node's own registry project credentials (Harbor robot account)
     * so it can authenticate against the docker registry. Accessible to the
     * node's own client without holding any management permission.
     */
    async getRegistryCredentials(id: Node['id']): Promise<NodeRegistryCredentials> {
        const response = await this.client.get(`nodes/${id}/registry/credentials`);

        return response.data;
    }
}
