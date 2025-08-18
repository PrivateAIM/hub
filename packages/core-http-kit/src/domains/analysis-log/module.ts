/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Log } from '@privateaim/telemetry-kit';
import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisLog } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse } from '../types-base';

export class AnalysisLogAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisLog>): Promise<CollectionResourceResponse<Log>> {
        const { data: response } = await this.client.get(`analysis-logs${buildQuery(options)}`);
        return response;
    }

    async delete(options: BuildInput<AnalysisLog>): Promise<void> {
        await this.client.delete(`analysis-logs${buildQuery(options)}`);
    }
}
