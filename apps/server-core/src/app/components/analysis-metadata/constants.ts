/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '@privateaim/server-kit';

export { AnalysisMetadataCommand, AnalysisMetadataEvent } from '../../../core/domains/index.ts';

export const AnalysisMetadataTaskQueue = {
    type: MessageBusRoutingType.WORK,
    key: 'analysisMetadataTasks',
};
