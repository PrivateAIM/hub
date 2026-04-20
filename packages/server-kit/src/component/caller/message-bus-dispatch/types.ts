/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../logger';
import type { MessageBus, MessageBusRouting } from '../../../message-bus';

export type MessageBusDispatchComponentCallerOptions = {
    routing: MessageBusRouting,
    logging?: boolean,
    messageBus?: MessageBus,
    logger?: Logger,
};
