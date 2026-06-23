/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '@privateaim/messenger-kit';
import { AbstractMessageWakeup } from './base.ts';

/**
 * In-process wakeup — single instance only (no cross-instance fan-out). Used when
 * redis is not configured (tests, single-node deployments).
 */
export class MemoryMessageWakeup extends AbstractMessageWakeup {
    async notify(recipient: MessageParty): Promise<void> {
        this.dispatch(recipient);
    }
}
