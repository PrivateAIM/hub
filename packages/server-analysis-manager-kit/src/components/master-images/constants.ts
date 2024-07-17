/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum MasterImagesEvent {
    SYNCHRONISING = 'synchronizing',
    SYNCHRONIZED = 'synchronized',
    SYNCHRONIZATION_FAILED = 'synchronizationFailed',

    BUILDING = 'building',
    BUILT = 'built',
    BUILD_FAILED = 'buildFailed',

    PUSHING = 'pushing',
    PUSHED = 'pushed',
    PUSH_FAILED = 'pushFailed',
}

export enum MasterImagesCommand {
    SYNCHRONIZE = 'synchronize',
}

export const MasterImagesEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisMasterImagesEvents',
};

export const MasterImagesTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisMasterImagesCommands',
};
