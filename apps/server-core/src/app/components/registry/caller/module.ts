/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ILogger, MessageBus } from 'ergos';
import { MessageBusDispatchComponentCaller } from 'ergos';
import type { RegistryEventMap } from '../type.ts';
import { RegistryTaskMessageBusRouting } from '../constants.ts';

/**
 * Registry commands go through the queue only (plan 018 F17): whichever
 * replica's worker caller consumes RegistryTaskMessageBusRouting handles
 * them — in-process with the memory driver.
 */
export class RegistryComponentCaller extends MessageBusDispatchComponentCaller<RegistryEventMap> {
    constructor(ctx: { messageBus?: MessageBus, logger?: ILogger }) {
        super({
            routing: RegistryTaskMessageBusRouting,
            messageBus: ctx.messageBus,
            logger: ctx.logger,
        });
    }
}
