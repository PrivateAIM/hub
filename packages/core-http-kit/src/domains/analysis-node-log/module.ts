/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse } from '../types-base';

export class AnalysisNodeLogAPI extends BaseAPI {
    async getMany(options: BuildInput<AnalysisNodeLog> = {}): Promise<CollectionResourceResponse<Log>> {
        const { data: response } = await this.client.get(`analysis-node-logs${buildQuery(options)}`);
        return response;
    }

    async delete(options: BuildInput<AnalysisNodeLog> = {}): Promise<void> {
        await this.client.delete(`analysis-node-logs${buildQuery(options)}`);
    }

    async create(data: Partial<AnalysisNodeLog>): Promise<Log> {
        const { data: response } = await this.client.post('analysis-node-logs', data);
        return response;
    }
}
