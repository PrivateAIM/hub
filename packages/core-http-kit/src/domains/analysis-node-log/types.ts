/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse, EntityRecordResponse } from '../types-base';

/**
 * STANDALONE, for the same reasons as {@see IAnalysisLogAPI}: a query-keyed
 * `delete` returning `void`, and telemetry-kit's `Log` as the RESPONSE record
 * while `AnalysisNodeLog` is the REQUEST shape.
 */
export interface IAnalysisNodeLogAPI {
    getMany(options?: EntityQueryInput<AnalysisNodeLog>) : Promise<EntityCollectionResponse<Log>>;
    delete(options?: EntityQueryInput<AnalysisNodeLog>) : Promise<void>;
    create(data: Partial<AnalysisNodeLog>) : Promise<EntityRecordResponse<Log>>;
}
