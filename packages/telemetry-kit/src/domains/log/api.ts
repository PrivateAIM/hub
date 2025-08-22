/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { Log, LogInput } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { BaseAPI } from '../base';

export class LogAPI extends BaseAPI {
    async getMany(options?: BuildInput<Log>): Promise<CollectionResourceResponse<Log>> {
        const { data: response } = await this.client.get(`logs${buildQuery(options)}`);
        return response;
    }

    async deleteMany(options?: BuildInput<Log>): Promise<void> {
        await this.client.delete(`logs${buildQuery(options)}`);
    }

    async create(data: Partial<LogInput>): Promise<SingleResourceResponse<Log>> {
        const { data: response } = await this.client.post('logs', data);

        return response;
    }
}
