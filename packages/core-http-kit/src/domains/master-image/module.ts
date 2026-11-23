/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IMasterImageAPI } from './types';

export class MasterImageAPI extends BaseAPI implements IMasterImageAPI {
    async getMany(
        record?: EntityQueryInput<MasterImage>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<MasterImage>> {
        const response = await this.client.get(`master-images${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }

    async getOne(
        id: MasterImage['id'],
        record?: EntityQueryInput<MasterImage>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<MasterImage>> {
        const response = await this.client.get(
            `master-images/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(id: MasterImage['id'], options?: APIRequestOptions): Promise<EntityRecordResponse<MasterImage>> {
        const response = await this.client.delete(`master-images/${id}`, buildRequestConfig(options));

        return response.data;
    }

    /**
     * The `BUILD` command echoes the affected master image back, the `SYNC`
     * command has no single record to return — hence the `null` branch.
     */
    async runCommand(
        command: `${MasterImageCommand}`,
        data: Record<string, any> = {},
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<MasterImage | null>> {
        const actionData = {
            command,
            ...data,
        };

        const { data: response } = await this.client.post(
            'master-images/command',
            actionData,
            buildRequestConfig(options),
        );

        return response;
    }
}
