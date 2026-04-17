/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../../services';
import type { QueueRouter, QueueRouterRouting } from '../../../queue-router';

export type QueueSelfComponentCallerOptions = {
    publishQueue?: QueueRouterRouting,
    consumeQueue: QueueRouterRouting,
    queueRouter?: QueueRouter,
    logger?: Logger,
};
