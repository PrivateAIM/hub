/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesSynchronizerExecutePayload,
    MasterImagesSynchronizerFailedEventPayload,
    MaterImagesSynchronizerExecutionFinishedEventPayload,
} from '../master-image-synchronizer';
import type {
    MasterImagesBuildCommandPayload, MasterImagesBuildFailedEventPayload,
    MasterImagesBuildingEventPayload,
    MasterImagesBuiltEventPayload,
} from './build';
import type { MasterImagesCommand, MasterImagesEvent } from './constants';
import type {
    MasterImagesPushCommandPayload,
    MasterImagesPushEventPayload, MasterImagesPushFailedEventPayload,
} from './push';

//-----------------------------------------------------------------------

type MasterImagesCommandMapRaw = {
    [MasterImagesCommand.BUILD]: MasterImagesBuildCommandPayload,
    [MasterImagesCommand.PUSH]: MasterImagesPushCommandPayload,
    [MasterImagesCommand.SYNCHRONIZE]: MasterImagesSynchronizerExecutePayload,
};

export type MasterImagesCommandMap = {
    [K in keyof MasterImagesCommandMapRaw as `${K}`]: MasterImagesCommandMapRaw[K]
};

export type MasterImagesCommandContext = {
    [K in keyof MasterImagesCommandMap]: {
        command: K,
        data: MasterImagesCommandMap[K]
    }
}[keyof MasterImagesCommandMap];

//-----------------------------------------------------------------------

type MasterImagesEventMapRaw = {
    [MasterImagesEvent.BUILDING]: MasterImagesBuildingEventPayload,
    [MasterImagesEvent.BUILT]: MasterImagesBuiltEventPayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBuildFailedEventPayload,

    [MasterImagesEvent.PUSHING]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSHED]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesPushFailedEventPayload,

    [MasterImagesEvent.SYNCHRONIZING]: Record<string, any>,
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizerExecutionFinishedEventPayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesSynchronizerFailedEventPayload
};

export type MasterImagesEventMap = {
    [K in keyof MasterImagesEventMapRaw as `${K}`]: MasterImagesEventMapRaw[K]
};

export type MasterImagesEventContext = {
    [K in keyof MasterImagesEventMap]: {
        event: K,
        data: MasterImagesEventMap[K]
    }
}[keyof MasterImagesEventMap];
