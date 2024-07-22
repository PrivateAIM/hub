/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';
import type { MasterImagesCommand, MasterImagesEvent } from './constants';

export type MasterImagesBasePayload = {
    error?: Error
};

export type MasterImagesSynchronizeCommandPayload = {
    owner: string,
    repository: string,
    branch: string
};

export type MasterImagesSynchronizeCommandContext = {
    command: `${MasterImagesCommand.SYNCHRONIZE}`,
    data: MasterImagesSynchronizeCommandPayload,
};

export type MasterImagesBuildCommandPayload = {
    images: Image[],
    directory: string
};
export type MasterImagesBuildCommandContext = {
    command: `${MasterImagesCommand.BUILD}`,
    data: MasterImagesBuildCommandPayload,
};

//-----------------------------------------------------------------------

export type MasterImagesPushCommandPayloadTag = { name: string, registryId: string };
export type MasterImagesPushCommandPayload = {
    tags: MasterImagesPushCommandPayloadTag[]
};

export type MasterImagesPushCommandContext = {
    command: `${MasterImagesCommand.PUSH}`,
    data: MasterImagesPushCommandPayload,
};

//-----------------------------------------------------------------------

export type MaterImagesSynchronizedEventPayload = {
    images: Image[],
    groups: Group[]
};
export type MasterImagesSynchronizedEventContext = {
    data: MaterImagesSynchronizedEventPayload,
    event: `${MasterImagesEvent.SYNCHRONIZED}`;
};
export type MasterImagesSynchronizingEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.SYNCHRONIZING}`;
};

//-----------------------------------------------------------------------

export type MasterImagesFailedEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.BUILD_FAILED}` |
        `${MasterImagesEvent.SYNCHRONIZATION_FAILED}` |
        `${MasterImagesEvent.PUSH_FAILED}`;
};

//-----------------------------------------------------------------------

export type MasterImagesBuildEventPayload = MasterImagesBuildCommandPayload;
export type MasterImagesBuildEventContext = {
    data: MasterImagesBuildEventPayload,
    event: `${MasterImagesEvent.BUILDING}` |
        `${MasterImagesEvent.BUILT}`;
};

//-----------------------------------------------------------------------

export type MasterImagesPushEventContext = {
    data: MasterImagesPushCommandPayload,
    event: `${MasterImagesEvent.PUSHING}` |
        `${MasterImagesEvent.PUSHED}`;
};

//-----------------------------------------------------------------------

export type MasterImagesCommandContext = MasterImagesSynchronizeCommandContext |
MasterImagesBuildCommandContext |
MasterImagesPushCommandContext;

export type MasterImagesEventContext = MasterImagesSynchronizedEventContext |
MasterImagesSynchronizingEventContext |
MasterImagesBuildEventContext |
MasterImagesPushEventContext |
MasterImagesFailedEventContext;
