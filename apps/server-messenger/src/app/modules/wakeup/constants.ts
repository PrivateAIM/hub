/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IMessageWakeup } from '../../../core/services/wakeup/index.ts';

export const WakeupInjectionKey = new TypedToken<IMessageWakeup>('MessageWakeup');

/** Redis pub/sub channel carrying payload-free `{ recipient }` wakeups across instances. */
export const MESSAGE_WAKEUP_CHANNEL = 'messenger:wakeup';
