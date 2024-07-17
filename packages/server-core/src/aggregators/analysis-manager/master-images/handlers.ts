/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MaterImagesSynchronizedEventPayload } from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesEvent,
} from '@privateaim/server-analysis-manager-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { syncMasterImageGroups, syncMasterImages } from './utils';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<{
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload
}> {
    return {
        [MasterImagesEvent.SYNCHRONIZED]: async (message) => {
            // languages
            await syncMasterImageGroups(message.data.groups);

            // images
            await syncMasterImages(message.data.images);
        },
    };
}
