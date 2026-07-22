/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { Log, LogInput } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { BaseAPI } from '../base';

export class LogAPI extends BaseAPI {
    async getMany(options?: EntityQueryInput<Log>): Promise<CollectionResourceResponse<Log>> {
        const { data: response } = await this.client.get(`logs${buildQueryString(options)}`);
        return response;
    }

    async deleteMany(options?: EntityQueryInput<Log>): Promise<void> {
        await this.client.delete(`logs${buildQueryString(options)}`);
    }

    async create(data: LogInput): Promise<SingleResourceResponse<Log>> {
        const { data: response } = await this.client.post('logs', data);

        return response;
    }
}
