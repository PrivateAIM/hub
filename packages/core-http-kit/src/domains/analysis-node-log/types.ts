/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
import type { EntityQueryInput } from '../../utils';
import type { APIRequestOptions, EntityCollectionResponse, EntityRecordResponse } from '../types';

/**
 * STANDALONE, for the same reasons as {@see IAnalysisLogAPI}: a query-keyed
 * `delete` returning `void`, and telemetry-kit's `Log` as the RESPONSE record
 * while `AnalysisNodeLog` is the REQUEST shape.
 */
export interface IAnalysisNodeLogAPI {
    getMany(record?: EntityQueryInput<AnalysisNodeLog>, options?: APIRequestOptions) : Promise<EntityCollectionResponse<Log>>;
    delete(record?: EntityQueryInput<AnalysisNodeLog>, options?: APIRequestOptions) : Promise<void>;
    create(data: Partial<AnalysisNodeLog>, options?: APIRequestOptions) : Promise<EntityRecordResponse<Log>>;
}
