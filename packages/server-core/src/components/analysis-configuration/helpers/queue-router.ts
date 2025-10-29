/*
 * Copyright (c) 2021-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueueRouterPublishPayload } from '@privateaim/server-kit';
import type { QueueRouterPayload } from '@privateaim/server-kit';
import type { AnalysisConfigurationCommand } from '../constants';
import { AnalysisConfigurationTaskQueue } from '../constants';
import type { AnalysisConfigurationRecalcPayload } from '../types';

export function buildAnalysisConfigurationTaskQueueRouterPayload(
    command: AnalysisConfigurationCommand,
    data: AnalysisConfigurationRecalcPayload,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: command,
        data,
        metadata: {
            routing: AnalysisConfigurationTaskQueue,
        },
    });
}
