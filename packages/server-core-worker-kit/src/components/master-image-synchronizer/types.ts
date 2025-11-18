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
export type MasterImageSynchronizerExecutePayload = {
    owner: string,
    repository: string,
    branch: string
};

export type MasterImageSynchronizerFailedEventPayload = {
    error: Error
};

export type MasterImageSynchronizerExecutionFinishedPayload = {
    images: MasterImageSynchronizerImage[],
    groups: MasterImageSynchronizerGroup[]
};

export type MasterImageSynchronizerEventMap = ObjectLiteralKeys<{
    [MasterImageSynchronizerCommand.EXECUTE]: [MasterImageSynchronizerExecutePayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_STARTED]: [MasterImageSynchronizerExecutePayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_FAILED]: [MasterImageSynchronizerFailedEventPayload, ComponentMetadata],
    [MasterImageSynchronizerEvent.EXECUTION_FINISHED]: [MasterImageSynchronizerExecutionFinishedPayload, ComponentMetadata],
}>;
