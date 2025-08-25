/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum BuilderEvent {
    BUILD_FAILED = 'buildFailed',
    BUILDING = 'building',
    BUILT = 'built',

    PUSH_FAILED = 'pushFailed',
    PUSHING = 'pushing',
    PUSHED = 'pushed',

    CHECK_FAILED = 'checkFailed',
    CHECKING = 'checking',
    CHECKED = 'checked',

    NONE = 'none',
}

export enum BuilderCommand {
    BUILD = 'build',
    CHECK = 'check',
    PUSH = 'push',
}

export enum BuilderErrorCode {
    ENTRYPOINT_NOT_FOUND = 'entrypointNotFound',
    MASTER_IMAGE_NOT_FOUND = 'masterImageNotFound',
    UNKNOWN = 'unknown',
}

export const BuilderEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisBuilderEvents',
};

export const BuilderTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisBuilderCommands',
};
