/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesBuildCommandPayload,
    MasterImagesBuildingEventPayload,
    MasterImagesBuiltEventPayload,
} from './build';
import type { MasterImagesCommand, MasterImagesEvent } from './constants';
import type {
    MasterImagesPushCommandPayload,
    MasterImagesPushEventPayload,
} from './push';
import type {
    MasterImagesSynchronizeCommandPayload,
    MaterImagesSynchronizedEventPayload,
} from './synchronize';

export type MasterImagesBasePayload = {
    error?: Error
};

//-----------------------------------------------------------------------

export type MasterImagesCommandMap = {
    [MasterImagesCommand.BUILD]: MasterImagesBuildCommandPayload,
    [MasterImagesCommand.PUSH]: MasterImagesPushCommandPayload,
    [MasterImagesCommand.SYNCHRONIZE]: MasterImagesSynchronizeCommandPayload,
};

export type MasterImagesCommandContext = {
    [K in keyof MasterImagesCommandMap]: {
        command: K,
        data: MasterImagesCommandMap[K]
    }
}[keyof MasterImagesCommandMap];

//-----------------------------------------------------------------------

export type MasterImagesEventMap = {
    [MasterImagesEvent.BUILDING]: MasterImagesBuildingEventPayload,
    [MasterImagesEvent.BUILT]: MasterImagesBuiltEventPayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.PUSHING]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSHED]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.SYNCHRONIZING]: MasterImagesBasePayload,
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesBasePayload
};

export type MasterImagesEventContext = {
    [K in keyof MasterImagesEventMap]: {
        event: K,
        data: MasterImagesEventMap[K]
    }
}[keyof MasterImagesEventMap];
