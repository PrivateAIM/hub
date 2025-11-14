/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisMetadataCommand {
    RECALC = 'recalc',
}

export enum AnalysisMetadataEvent {
    RECALC_FINISHED = 'recalcFinished',
}

export const AnalysisMetadataTaskQueue = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisMetadataTasks',
};
