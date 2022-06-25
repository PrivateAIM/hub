/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerRouterEvent {
    STARTING = 'starting',
    STARTED = 'started',

    ROUTING = 'routing',
    ROUTED = 'routed',

    POSITION_FOUND = 'positionFound',
    POSITION_NOT_FOUND = 'positionNotFound',

    CHECKING = 'checking',
    CHECKED = 'checked',

    FINISHED = 'finished',

    FAILED = 'failed',
}

export enum TrainManagerRouterCommand {
    START = 'start',
    ROUTE = 'route',
    CHECK = 'check',
}

export enum TrainManagerRouterErrorCode {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    ROUTE_EMPTY = 'routeEmpty',
    OPERATOR_INVALID = 'operatorInvalid',
    UNKNOWN = 'unknown',
}
