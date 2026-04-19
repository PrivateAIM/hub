/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../logger';
import type { QueueRouter, QueueRouterRouting } from '../../../queue-router';

export type QueueDispatchComponentCallerOptions = {
    queue: QueueRouterRouting,
    logging?: boolean,
    queueRouter?: QueueRouter,
    logger?: Logger,
};
