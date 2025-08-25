/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageCommandArgument } from '@privateaim/core-kit';

export type MasterImageSyncData = {
    name: string,
    path: string,
    virtualPath: string,
    command: string,
    commandArguments?: MasterImageCommandArgument[]
};

export type MasterImageGroupSyncData = {
    name: string,
    path: string,
    virtualPath: string,
};

export type MasterImagesSynchronizeCommandPayload = {
    owner: string,
    repository: string,
    branch: string
};

export type MasterImagesSynchronizationFailedEventPayload = {
    error: Error
};

export type MaterImagesSynchronizedEventPayload = {
    images: MasterImageSyncData[],
    groups: MasterImageGroupSyncData[]
};
