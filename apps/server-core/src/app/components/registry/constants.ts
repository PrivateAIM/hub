/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export { RegistryCommand, RegistryHookEvent } from '../../../core/domains/index.ts';

export const RegistryEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'registryEvents',
};

export const RegistryTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'registryCommands',
};
