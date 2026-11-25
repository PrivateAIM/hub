/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { APIRequestOptions, EntityCollectionResponse } from '../types';

/** Read-only: components appear through the node status report routes. */
export interface INodeComponentAPI {
    getMany(
        record?: EntityQueryInput<NodeComponent>,
        options?: APIRequestOptions,
    ) : Promise<EntityCollectionResponse<NodeComponent>>;
}
