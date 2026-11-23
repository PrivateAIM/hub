/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IAnalysisNodeEventAPI } from './types';

export class AnalysisNodeEventAPI extends BaseAPI implements IAnalysisNodeEventAPI {
    async getMany(
        record?: EntityQueryInput<AnalysisNodeEvent>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<AnalysisNodeEvent>> {
        const { data: response } = await this.client.get(
            `analysis-node-events${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async getOne(
        id: AnalysisNodeEvent['id'],
        record?: EntityQueryInput<AnalysisNodeEvent>,
        options?: APIRequestOptions,
    ): Promise<EntityRecordResponse<AnalysisNodeEvent>> {
        const { data: response } = await this.client.get(
            `analysis-node-events/${id}${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }
}
