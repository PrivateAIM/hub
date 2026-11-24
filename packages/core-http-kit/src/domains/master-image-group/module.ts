/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { MasterImageGroup } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';

import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import { encodePathSegment } from '@authup/core-http-kit';
import type { IMasterImageGroupAPI } from './types';

export class MasterImageGroupAPI extends BaseAPI implements IMasterImageGroupAPI {
    async getMany(
        record?: EntityQueryInput<MasterImageGroup>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<MasterImageGroup>> {
        const response = await this.client.get(
            `master-image-groups${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async getOne(
        id: MasterImageGroup['id'],
        record?: EntityQueryInput<MasterImageGroup>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<MasterImageGroup>> {
        const response = await this.client.get(
            `master-image-groups/${encodePathSegment(id)}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response.data;
    }

    async delete(
        id: MasterImageGroup['id'],
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<MasterImageGroup>> {
        const response = await this.client.delete(`master-image-groups/${encodePathSegment(id)}`, buildRequestConfig(options));

        return response.data;
    }
}
