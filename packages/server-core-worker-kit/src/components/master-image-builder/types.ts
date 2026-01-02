/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { Progress } from 'docken';
import type { MasterImageBuilderCommand, MasterImageBuilderEvent } from './constants';

export type MasterImageBuilderBasePayload = {
    id: string,
    error?: Error
};

export type MasterImageBuilderExecutePayload = MasterImageBuilderBasePayload;
export type MasterImageBuilderExecutionProgressPayload = MasterImageBuilderBasePayload & {
    progress: Progress
};

export type MasterImageBuilderEventMap = ObjectLiteralKeys<{
    [MasterImageBuilderCommand.EXECUTE]: [MasterImageBuilderExecutePayload, ComponentMetadata],
    [MasterImageBuilderEvent.EXECUTION_STARTED]: [MasterImageBuilderExecutePayload, ComponentMetadata],
    [MasterImageBuilderEvent.EXECUTION_PROGRESS]: [MasterImageBuilderExecutionProgressPayload, ComponentMetadata],
    [MasterImageBuilderEvent.EXECUTION_FINISHED]: [MasterImageBuilderBasePayload, ComponentMetadata],
    [MasterImageBuilderEvent.EXECUTION_FAILED]: [MasterImageBuilderBasePayload, ComponentMetadata],
}>;
