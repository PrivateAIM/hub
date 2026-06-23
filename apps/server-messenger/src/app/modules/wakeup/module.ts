/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { MessageParty } from '@privateaim/messenger-kit';
import { WakeupEventName } from '@privateaim/messenger-kit';
import { LoggerInjectionKey, RedisClientInjectionKey } from '@privateaim/server-kit';
import { MemoryMessageWakeup } from '../../../core/services/wakeup/index.ts';
import type { IMessageWakeup } from '../../../core/services/wakeup/index.ts';
import { buildConnectionRoomForIdentity } from '../../../adapters/socket/controllers/connection/helpers.ts';
import { HTTPInjectionKey } from '../http/constants.ts';
import { RedisMessageWakeup } from './redis.ts';
import { WakeupInjectionKey } from './constants.ts';

/**
 * Wires the message wakeup. Picks the redis pub/sub transport when redis is
 * available (cross-instance), otherwise an in-process fallback. On every wakeup
 * it emits a payload-free `messagePending` to the recipient's local socket room.
 */
export class WakeupModule implements IModule {
    readonly name = 'wakeup';

    readonly dependencies: string[] = ['config'];

    private wakeup: RedisMessageWakeup | undefined;

    async setup(container: IContainer): Promise<void> {
        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;

        const onPending = (recipient: MessageParty) => {
            const socketResult = container.tryResolve(HTTPInjectionKey.SocketServer);
            if (!socketResult.success) {
                return;
            }

            const room = buildConnectionRoomForIdentity(recipient);
            // `.local`: every instance already receives the wakeup via our own pub/sub and
            // emits to its own sockets — bypass the socket.io redis adapter to avoid duplicates.
            socketResult.data.local.in(room).emit(WakeupEventName.MESSAGE_PENDING, { recipient });
        };

        const redisResult = container.tryResolve(RedisClientInjectionKey);

        let wakeup: IMessageWakeup;
        if (redisResult.success) {
            const redis = new RedisMessageWakeup({
                publishClient: redisResult.data,
                subscribeClient: redisResult.data.duplicate(),
                onPending,
            });
            await redis.start();
            this.wakeup = redis;
            wakeup = redis;
        } else {
            wakeup = new MemoryMessageWakeup({ onPending });
            logger?.warn('Message wakeup running in-memory — cross-instance long-poll/socket wakeup disabled (no redis)');
        }

        container.register(WakeupInjectionKey, { useValue: wakeup });
    }

    async teardown(): Promise<void> {
        if (this.wakeup) {
            await this.wakeup.stop();
            this.wakeup = undefined;
        }
    }
}
