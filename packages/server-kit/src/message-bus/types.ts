/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IMessageBusDriver, MessageRouting } from 'hubwire';

export type MessageBusLogHooksOptions = {
    /**
     * Routings whose publishes are not logged (the log and event queues).
     */
    silentRoutings?: MessageRouting[],
};

export type MessageBusModuleOptions = MessageBusLogHooksOptions & {
    driverFactory?: (container: IContainer) => IMessageBusDriver,
};
