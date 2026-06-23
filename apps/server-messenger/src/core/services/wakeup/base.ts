/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '@privateaim/messenger-kit';
import type { IMessageWakeup, MessageWakeupContext } from './types.ts';

/**
 * Shared parking logic for the wakeup implementations: a registry of locally
 * parked long-poll waiters, keyed by recipient identity. `notify` is left to the
 * concrete transport (in-process vs redis pub/sub); both call {@link dispatch}
 * to resolve local waiters and fire the socket-emit hook.
 */
export abstract class AbstractMessageWakeup implements IMessageWakeup {
    private waiters = new Map<string, Set<() => void>>();

    private listeners = new Map<string, Set<() => void>>();

    protected onPending: ((recipient: MessageParty) => void) | undefined;

    constructor(ctx: MessageWakeupContext = {}) {
        this.onPending = ctx.onPending;
    }

    abstract notify(recipient: MessageParty): Promise<void>;

    wait(recipient: MessageParty, timeoutMs: number): Promise<void> {
        return new Promise<void>((resolve) => {
            const key = this.keyFor(recipient);
            let set = this.waiters.get(key);
            if (!set) {
                set = new Set();
                this.waiters.set(key, set);
            }

            let settled = false;
            const settle = () => {
                if (settled) {
                    return;
                }
                settled = true;
                set.delete(settle);
                if (set.size === 0) {
                    this.waiters.delete(key);
                }
                clearTimeout(timer);
                resolve();
            };

            set.add(settle);

            const timer = setTimeout(settle, Math.max(0, timeoutMs));
            if (typeof timer.unref === 'function') {
                timer.unref();
            }
        });
    }

    subscribe(recipient: MessageParty, listener: () => void): () => void {
        const key = this.keyFor(recipient);
        let set = this.listeners.get(key);
        if (!set) {
            set = new Set();
            this.listeners.set(key, set);
        }
        set.add(listener);

        return () => {
            set.delete(listener);
            if (set.size === 0) {
                this.listeners.delete(key);
            }
        };
    }

    /** Resolve locally-parked long-polls + persistent listeners for `recipient`, then fire the socket-emit hook. */
    protected dispatch(recipient: MessageParty): void {
        const key = this.keyFor(recipient);

        const waiterSet = this.waiters.get(key);
        if (waiterSet) {
            for (const settle of [...waiterSet]) {
                settle();
            }
        }

        const listenerSet = this.listeners.get(key);
        if (listenerSet) {
            for (const listener of [...listenerSet]) {
                try {
                    listener();
                } catch {
                    // a failing listener (e.g. a closed SSE stream) must not break others
                }
            }
        }

        this.onPending?.(recipient);
    }

    protected keyFor(recipient: MessageParty): string {
        return `${recipient.type}:${recipient.id}`;
    }
}
