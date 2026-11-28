/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import { BaseAPI } from 'hapic';
import type { EntityQueryInput } from '../../utils';
import { buildQueryString } from '../../utils';
import type { APIRequestOptions, EntityCollectionResponse } from '../types';
import { buildRequestConfig } from '../utils';
import type { INodeComponentAPI } from './types';

export class NodeComponentAPI extends BaseAPI implements INodeComponentAPI {
    async getMany(
        record?: EntityQueryInput<NodeComponent>,
        options?: APIRequestOptions,
    ): Promise<EntityCollectionResponse<NodeComponent>> {
        const response = await this.client.get(`node-components${buildQueryString(record)}`, buildRequestConfig(options));

        return response.data;
    }
}
