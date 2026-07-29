/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisLog } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
import type { EntityQueryInput } from '../../utils';
import type { EntityCollectionResponse } from '../types-base';

/**
 * STANDALONE — deliberately not `IEntityAPISlim`. Two shapes make analysis
 * logs incompatible with the entity family:
 *
 * - `delete` is keyed by a QUERY, not by an id, and resolves to `void`.
 * - the collection carries telemetry-kit's `Log`, not `AnalysisLog`: an
 *   analysis log is a query projection over the telemetry log store, and
 *   `AnalysisLog` itself declares no `id`.
 */
export interface IAnalysisLogAPI {
    getMany(options?: EntityQueryInput<AnalysisLog>) : Promise<EntityCollectionResponse<Log>>;
    delete(options: EntityQueryInput<AnalysisLog>) : Promise<void>;
}
