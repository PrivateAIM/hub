/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Cache, QueueRouter, QueueRouterHandlers } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload, useCache, useQueueRouter } from '@privateaim/server-kit';
import { cleanupPayload } from '../../../utils';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    MasterImagesEventQueueRouterRouting,
    MasterImagesTaskQueueRouterRouting,
} from '../constants';
import type {
    MasterImagesCommandContext,
    MasterImagesCommandMap,
    MasterImagesEventContext,
    MasterImagesEventMap,
} from '../types';

export class MasterImageQueueService {
    protected cache : Cache;

    protected queueRouter : QueueRouter;

    constructor() {
        this.cache = useCache();
        this.queueRouter = useQueueRouter();
    }

    // -------------------------------------------------

    async publishCommand(ctx: MasterImagesCommandContext) {
        const isLocked = await this.isCommandLocked(ctx.command);
        if (isLocked) {
            throw new Error('The command is locked and can therefore not be executed.');
        }

        const routerPayload = this.buildRouterPayloadForCommand(ctx);
        await this.queueRouter.publish(routerPayload);

        if (ctx.command === MasterImagesCommand.SYNCHRONIZE) {
            await this.setCommandLock(ctx.command);
        }
    }

    async consumeCommands(
        handlers: QueueRouterHandlers<Partial<MasterImagesCommandMap>>,
    ) {
        await this.queueRouter.consume(MasterImagesTaskQueueRouterRouting, {
            $any: async (message) => {
                if (handlers[message.type]) {
                    await handlers[message.type](message, this);
                }

                if (handlers.$any) {
                    await handlers.$any(message);
                }
            },
        });
    }

    // -------------------------------------------------

    async publishEvent(ctx: MasterImagesEventContext) {
        const routerPayload = this.buildRouterPayloadForEvent(ctx);
        await this.queueRouter.publish(routerPayload);
    }

    async consumeEvents(
        handlers: QueueRouterHandlers<Partial<MasterImagesEventMap>>,
    ) {
        await this.queueRouter.consume(MasterImagesEventQueueRouterRouting, {
            $any: async (message) => {
                if (
                    message.type === MasterImagesEvent.BUILD_FAILED ||
                    message.type === MasterImagesEvent.PUSH_FAILED ||
                    message.type === MasterImagesEvent.SYNCHRONIZED ||
                    message.type === MasterImagesEvent.SYNCHRONIZATION_FAILED
                ) {
                    await this.clearCommandLock(MasterImagesCommand.SYNCHRONIZE);
                } else {
                    await this.setCommandLock(MasterImagesCommand.SYNCHRONIZE);
                }

                if (handlers[message.type]) {
                    await handlers[message.type](message);
                }

                if (handlers.$any) {
                    await handlers.$any(message);
                }
            },
        });
    }

    // -------------------------------------------------

    protected async setCommandLock(command: string) {
        await this.cache.set(`master-images-command:${command}`, true, {
            ttl: 1000 * 120,
        });
    }

    protected async isCommandLocked(command: string) {
        const isActive = await this.cache.get(`master-images-command:${command}`);

        return !!isActive;
    }

    protected async clearCommandLock(command: string) {
        await this.cache.drop(`master-images-command:${command}`);
    }

    // -------------------------------------------------

    protected buildRouterPayloadForEvent(context: MasterImagesEventContext) {
        return buildQueueRouterPublishPayload({
            type: context.event,
            data: cleanupPayload(context.data),
            metadata: {
                routing: MasterImagesEventQueueRouterRouting,
            },
        });
    }

    protected buildRouterPayloadForCommand(context: MasterImagesCommandContext) {
        return buildQueueRouterPublishPayload({
            type: context.command,
            data: cleanupPayload(context.data),
            metadata: {
                routing: MasterImagesTaskQueueRouterRouting,
            },
        });
    }
}
