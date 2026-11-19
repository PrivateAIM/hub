/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IAnalysisNodeLogAPI } from './types';

export class AnalysisNodeLogAPI extends BaseAPI implements IAnalysisNodeLogAPI {
    async getMany(
        record: EntityQueryInput<AnalysisNodeLog> = {},
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<Log>> {
        const { data: response } = await this.client.get(
            `analysis-node-logs${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async delete(record: EntityQueryInput<AnalysisNodeLog> = {}, options?: APIRequestOptions): Promise<void> {
        await this.client.delete(`analysis-node-logs${buildQueryString(record)}`, buildRequestConfig(options));
    }

    async create(data: Partial<AnalysisNodeLog>, options?: APIRequestOptions): Promise<EntityRecordResponse<Log>> {
        const { data: response } = await this.client.post('analysis-node-logs', data, buildRequestConfig(options));

        return response;
    }
}
