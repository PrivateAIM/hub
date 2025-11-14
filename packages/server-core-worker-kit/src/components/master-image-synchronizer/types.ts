/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageCommandArgument } from '@privateaim/core-kit';
import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { MasterImageSynchronizerCommand, MasterImageSynchronizerEvent } from './constants';

export type MasterImageSynchronizerImage = {
    name: string,
    path: string,
    virtualPath: string,
    command: string,
    commandArguments?: MasterImageCommandArgument[]
};
export type MasterImageSynchronizerGroup = {
    name: string,
    path: string,
    virtualPath: string,
};
export type MasterImagesSynchronizerExecutePayload = {
    owner: string,
    repository: string,
    branch: string
};
export type MasterImagesSynchronizerFailedEventPayload = {
    error: Error
};

export type MaterImagesSynchronizerExecutionFinishedEventPayload = {
    images: MasterImageSynchronizerImage[],
    groups: MasterImageSynchronizerGroup[]
};

export type MasterImageSynchronizerEventMap = ObjectLiteralKeys<{
    [MasterImageSynchronizerCommand.EXECUTE]: [MasterImagesSynchronizerExecutePayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_STARTED]: [MasterImagesSynchronizerExecutePayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_FAILED]: [MasterImagesSynchronizerFailedEventPayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_FINISHED]: [MaterImagesSynchronizerExecutionFinishedEventPayload, ComponentMetadata],
}>;
