/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';

/** Read-only: node events are emitted by the platform, never authored over HTTP. */
export interface IAnalysisNodeEventAPI {
    getMany(options?: EntityQueryInput<AnalysisNodeEvent>) : Promise<EntityCollectionResponse<AnalysisNodeEvent>>;
    getOne(id: AnalysisNodeEvent['id']) : Promise<EntityRecordResponse<AnalysisNodeEvent>>;
}
