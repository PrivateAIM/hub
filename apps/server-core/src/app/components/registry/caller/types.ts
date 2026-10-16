/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DispatchCallerHooks, IMessageBus } from 'synergos';

export type RegistryComponentCallerContext = {
    messageBus?: IMessageBus,
    hooks?: DispatchCallerHooks,
};
