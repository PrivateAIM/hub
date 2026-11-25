/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString, nullifyEmptyObjectProperties } from '../../utils';
import type {
    Node,
    NodeComponent,
    NodeComponentReport,
    NodeComponentsReport,
} from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { encodePathSegment } from '@authup/core-http-kit';
import type {
    INodeAPI,
    NodeClientCredentials,
    NodeClientCredentialsUpdate,
    NodeCreatePayload,
    NodeRegistryCredentials,
    NodeUpdatePayload,
} from './types';

export class NodeAPI extends BaseAPI implements INodeAPI {
    async getMany(record?: EntityQueryInput<Node>, options?: APIRequestOptions): Promise<EntityCollectionResponse<Node>> {
        const response = await this.client.get(`nodes${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: Node['id'],
        record?: EntityQueryInput<Node>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Node>> {
        const response = await this.client.get(`nodes/${encodePathSegment(id)}${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async create(data: NodeCreatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Node>> {
        const response = await this.client.post('nodes', nullifyEmptyObjectProperties(data), buildRequestConfig(options));

        return response.data;
    }

    async update(id: Node['id'], data: NodeUpdatePayload, options?: APIRequestOptions): Promise<EntityRecordResponse<Node>> {
        const response = await this.client.post(
            `nodes/${encodePathSegment(id)}`,
            nullifyEmptyObjectProperties(data),
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(id: Node['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<Node>> {
        const response = await this.client.delete(`nodes/${encodePathSegment(id)}`, buildRequestConfig(options));

        return response.data;
    }

    async runCommand(
        id: Node['id'],
        task: string,
        data: Record<string, any>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<Node>> {
        const response = await this.client.post(`nodes/${encodePathSegment(id)}/task`, { task, ...data }, buildRequestConfig(options));

        return response.data;
    }

    async getClientCredentials(id: Node['id'], options?: APIRequestOptions): Promise<NodeClientCredentials> {
        const response = await this.client.get(`nodes/${encodePathSegment(id)}/client/credentials`, buildRequestConfig(options));

        return response.data;
    }

    /**
     * Update the node client's credentials. An omitted `secret` rotates to a
     * fresh one; an omitted `name` / `displayName` leaves that field unchanged.
     * Returns the new credentials once.
     */
    async setClientCredentials(
        id: Node['id'],
        data?: NodeClientCredentialsUpdate,
        options?: APIRequestOptions,
    ): Promise<NodeClientCredentials> {
        const response = await this.client.post(
            `nodes/${encodePathSegment(id)}/client/credentials`,
            data ?? {},
            buildRequestConfig(options),
        );

        return response.data;
    }

    /**
     * Read the node's own registry project credentials (Harbor robot account)
     * so it can authenticate against the docker registry. Accessible to the
     * node's own client without holding any management permission.
     */
    async getRegistryCredentials(id: Node['id'], options?: APIRequestOptions): Promise<NodeRegistryCredentials> {
        const response = await this.client.get(`nodes/${encodePathSegment(id)}/registry/credentials`, buildRequestConfig(options));

        return response.data;
    }

    async reportStatus(
        id: Node['id'],
        data: NodeComponentsReport,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<NodeComponent>> {
        const response = await this.client.put(`nodes/${encodePathSegment(id)}/status`, data, buildRequestConfig(options));

        return response.data;
    }

    async reportComponentStatus(
        id: Node['id'],
        name: string,
        data: Omit<NodeComponentReport, 'name'>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<NodeComponent>> {
        const response = await this.client.put(
            `nodes/${encodePathSegment(id)}/components/${encodePathSegment(name)}/status`,
            data,
            buildRequestConfig(options),
        );

        return response.data;
    }
}
