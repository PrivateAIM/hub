/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';
import type { MasterImagesCommand, MasterImagesEvent } from '../constants';
import type { MasterImagesBasePayload } from '../types';

export type MasterImagesSynchronizeCommandPayload = {
    owner: string,
    repository: string,
    branch: string
};

export type MasterImagesSynchronizeCommandContext = {
    command: `${MasterImagesCommand.SYNCHRONIZE}`,
    data: MasterImagesSynchronizeCommandPayload,
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
