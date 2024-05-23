/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuilderCommand, ComponentName } from '@privateaim/server-analysis-manager-kit';
import type { BuilderCommandContext } from '@privateaim/server-analysis-manager-kit';
import { extendPayload } from '../utils';
import {
    executeBuilderBuildCommand,
    executeBuilderCheckCommand,
    executePushCommand,
} from './commands';
import {
    writeBuildingEvent,
    writeBuiltEvent,
    writeCheckedEvent,
    writeCheckingEvent,
    writeFailedEvent,
    writePushedEvent,
    writePushingEvent,
} from './events';
import { useBuilderLogger } from './utils';

export async function executeBuilderCommand(
    context: BuilderCommandContext,
) : Promise<void> {
    switch (context.command) {
        case BuilderCommand.BUILD: {
            await Promise.resolve(context.data)
                .then((data) => extendPayload(data, ComponentName.BUILDER))
                .then((data) => writeBuildingEvent({ data, command: context.command }))
                .then(executeBuilderBuildCommand)
                .then((data) => writeBuiltEvent({ data, command: context.command }))
                .then((data) => writePushingEvent({ data, command: context.command }))
                .then(executePushCommand)
                .then((data) => writePushedEvent({ data, command: context.command }))
                .catch((err: Error) => {
                    useBuilderLogger().error(err);

                    return writeFailedEvent({
                        data: context.data,
                        command: context.command,
                        error: err,
                    });
                });
            break;
        }
        case BuilderCommand.CHECK: {
            await Promise.resolve(context.data)
                .then((data) => extendPayload(data, ComponentName.BUILDER))
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(executeBuilderCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err: Error) => {
                    useBuilderLogger().error(err);

                    return writeFailedEvent({
                        data: context.data,
                        command: context.command,
                        error: err,
                    });
                });
            break;
        }
    }
}
