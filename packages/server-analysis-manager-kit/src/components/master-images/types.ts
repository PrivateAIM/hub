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

export type MasterImagesSynchronizeCommandContext = {
    command: `${MasterImagesCommand.SYNCHRONIZE}`,
    data: MasterImagesBasePayload,
};

export type MaterImagesSynchronizedPayload = MasterImagesBasePayload & {
    images: Image[],
    groups: Group[]
};
export type MasterImagesSynchronizedEventContext = {
    data: MaterImagesSynchronizedPayload,
    event: `${MasterImagesEvent.SYNCHRONIZED}`;
};
export type MasterImagesSynchronizingEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.SYNCHRONISING}`;
};
export type MasterImagesSynchronizationFailedEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.SYNCHRONIZATION_FAILED}`;
};

export type MasterImagesBuildEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.BUILD_FAILED}` |
        `${MasterImagesEvent.BUILDING}` |
        `${MasterImagesEvent.BUILT}`;
};

export type MasterImagesPushEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.PUSH_FAILED}` |
        `${MasterImagesEvent.PUSHING}` |
        `${MasterImagesEvent.PUSHED}`;
};

export type MasterImagesCommandContext = MasterImagesSynchronizeCommandContext;
export type MasterImagesEventContext = MasterImagesSynchronizedEventContext |
MasterImagesSynchronizingEventContext |
MasterImagesSynchronizationFailedEventContext |
MasterImagesBuildEventContext |
MasterImagesPushEventContext;
