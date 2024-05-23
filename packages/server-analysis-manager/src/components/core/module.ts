/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CoreCommand } from '@privateaim/server-analysis-manager-kit';
import type { CoreCommandContext } from '@privateaim/server-analysis-manager-kit';
import {
    executeCoreConfigureCommand, executeCoreDestroyCommand,

} from './commands';
import {
    writeConfiguredEvent,
    writeConfiguringEvent,
    writeDestroyedEvent,
    writeDestroyingEvent,
    writeFailedEvent,
} from './events';
import { useCoreLogger } from './utils';

export async function executeCoreCommand(
    context: CoreCommandContext,
) : Promise<void> {
    switch (context.command) {
        case CoreCommand.CONFIGURE: {
            await Promise.resolve(context.data)
                .then((data) => writeConfiguringEvent({ data, command: context.command }))
                .then(executeCoreConfigureCommand)
                .then((data) => writeConfiguredEvent({ data, command: context.command }))
                .catch((err: Error) => {
                    useCoreLogger().error(err);

                    return writeFailedEvent({
                        data: context.data,
                        command: context.command,
                        error: err,
                    });
                });
            break;
        }
        case CoreCommand.DESTROY: {
            await Promise.resolve(context.data)
                .then((data) => writeDestroyingEvent({ data, command: context.command }))
                .then(executeCoreDestroyCommand)
                .then((data) => writeDestroyedEvent({ data, command: context.command }))
                .catch((err: Error) => {
                    useCoreLogger().error(err);

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
