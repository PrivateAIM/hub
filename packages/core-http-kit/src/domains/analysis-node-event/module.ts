/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { BaseAPI } from '../base';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class AnalysisNodeEventAPI extends BaseAPI {
    async getMany(options?: BuildInput<AnalysisNodeEvent>): Promise<CollectionResourceResponse<AnalysisNodeEvent>> {
        const { data: response } = await this.client.get(`analysis-node-events${buildQuery(options)}`);
        return response;
    }

    async getOne(id: AnalysisNodeEvent['id']): Promise<SingleResourceResponse<AnalysisNodeEvent>> {
        const { data: response } = await this.client.get(`analysis-node-events/${id}`);

        return response;
    }
}
