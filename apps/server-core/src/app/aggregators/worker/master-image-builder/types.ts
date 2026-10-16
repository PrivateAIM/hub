/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EventComponentDispatcher } from '@privateaim/server-telemetry-kit';
import type { MasterImageBuilderService } from '../../../../core/services/index.ts';

export type MasterImageBuilderAggregatorContext = {
    service: MasterImageBuilderService;
    eventComponentDispatcher?: EventComponentDispatcher;
};
