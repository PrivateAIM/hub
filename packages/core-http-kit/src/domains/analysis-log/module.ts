/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log } from '@privateaim/telemetry-kit';
import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { AnalysisLog } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { APIRequestOptions, EntityCollectionResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { IAnalysisLogAPI } from './types';

export class AnalysisLogAPI extends BaseAPI implements IAnalysisLogAPI {
    async getMany(
        record?: EntityQueryInput<AnalysisLog>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<Log>> {
        const { data: response } = await this.client.get(
            `analysis-logs${buildQueryString(record)}`,
            buildRequestConfig(options),
        );

        return response;
    }

    async delete(record: EntityQueryInput<AnalysisLog>, options?: APIRequestOptions): Promise<void> {
        await this.client.delete(`analysis-logs${buildQueryString(record)}`, buildRequestConfig(options));
    }
}
