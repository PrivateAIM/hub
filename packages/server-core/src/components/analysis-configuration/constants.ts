/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisConfigurationCommand {
    RECALC = 'recalc',
}

export const AnalysisConfigurationTaskQueue = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisConfigurationTasks',
};
