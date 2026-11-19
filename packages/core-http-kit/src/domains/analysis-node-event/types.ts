/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';

/** Read-only: node events are emitted by the platform, never authored over HTTP. */
export interface IAnalysisNodeEventAPI {
    getMany(
        record?: EntityQueryInput<AnalysisNodeEvent>,
        options?: APIRequestOptions,
    ) : Promise<EntityCollectionResponse<AnalysisNodeEvent>>;
    getOne(
        id: AnalysisNodeEvent['id'],
        record?: EntityQueryInput<AnalysisNodeEvent>,
        options?: APIRequestOptions,
    ) : Promise<EntityRecordResponse<AnalysisNodeEvent>>;
}
