/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '@privateaim/messenger-kit';

/**
 * Payload-free wakeup port. `notify` signals that a message is pending for a
 * recipient (waking connected sockets and parked long-polls, cross-instance);
 * `wait` parks a long-poll until such a signal arrives or the timeout elapses.
 */
export interface IMessageWakeup {
    notify(recipient: MessageParty): Promise<void>;

    wait(recipient: MessageParty, timeoutMs: number): Promise<void>;

    /**
     * Register a persistent listener fired on every wakeup for `recipient`
     * (used by the SSE stream); returns an unsubscribe function.
     */
    subscribe(recipient: MessageParty, listener: () => void): () => void;
}

export type MessageWakeupContext = {
    /** fired when a wakeup for `recipient` is observed on this instance (drives the socket emit) */
    onPending?: (recipient: MessageParty) => void
};
