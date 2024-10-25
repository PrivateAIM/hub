/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';
import type {
    MasterImagesBuildCommandContext,
    MasterImagesBuildEventContext,
} from './build';
import type { MasterImagesCommand, MasterImagesEvent } from './constants';
import type {
    MasterImagesPushCommandContext,
    MasterImagesPushEventContext,
} from './push';
import type {
    MasterImagesSynchronizeCommandContext,
    MasterImagesSynchronizedEventContext,
    MasterImagesSynchronizingEventContext,
} from './synchronize';

export type MasterImagesBasePayload = {
    error?: Error
};

//-----------------------------------------------------------------------

export type MasterImagesFailedEventContext = {
    data: MasterImagesBasePayload,
    event: `${MasterImagesEvent.BUILD_FAILED}` |
        `${MasterImagesEvent.SYNCHRONIZATION_FAILED}` |
        `${MasterImagesEvent.PUSH_FAILED}`;
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
