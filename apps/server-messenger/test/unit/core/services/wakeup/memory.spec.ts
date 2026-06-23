/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { MessageParty } from '@privateaim/messenger-kit';
import { MemoryMessageWakeup } from '../../../../../src/core/services/wakeup/index.ts';

const RECIPIENT: MessageParty = { type: 'client', id: randomUUID() };

describe('core/services/wakeup/memory', () => {
    it('should resolve a parked wait when the recipient is notified', async () => {
        const wakeup = new MemoryMessageWakeup();

        const waiting = wakeup.wait(RECIPIENT, 5000);
        await wakeup.notify(RECIPIENT);

        await expect(waiting).resolves.toBeUndefined();
    });

    it('should resolve after the timeout when never notified', async () => {
        const wakeup = new MemoryMessageWakeup();

        const start = Date.now();
        await wakeup.wait(RECIPIENT, 30);

        expect(Date.now() - start).toBeGreaterThanOrEqual(20);
    });

    it('should not wake waiters parked for a different recipient', async () => {
        const wakeup = new MemoryMessageWakeup();

        let woke = false;
        const waiting = wakeup.wait(RECIPIENT, 40).then(() => { woke = true; });

        await wakeup.notify({ type: 'user', id: randomUUID() });
        await new Promise((resolve) => { setTimeout(resolve, 10); });

        expect(woke).toBe(false);

        await waiting; // resolves on its own timeout
    });

    it('should fire the onPending hook on notify', async () => {
        const seen: string[] = [];
        const wakeup = new MemoryMessageWakeup({ onPending: (recipient) => seen.push(recipient.id) });

        await wakeup.notify(RECIPIENT);

        expect(seen).toEqual([RECIPIENT.id]);
    });

    it('should fire a subscribed listener on every notify until unsubscribed', async () => {
        const wakeup = new MemoryMessageWakeup();

        let count = 0;
        const unsubscribe = wakeup.subscribe(RECIPIENT, () => { count += 1; });

        await wakeup.notify(RECIPIENT);
        await wakeup.notify(RECIPIENT);
        expect(count).toBe(2);

        unsubscribe();
        await wakeup.notify(RECIPIENT);
        expect(count).toBe(2);
    });

    it('should not fire a listener subscribed for a different recipient', async () => {
        const wakeup = new MemoryMessageWakeup();

        let fired = false;
        wakeup.subscribe(RECIPIENT, () => { fired = true; });

        await wakeup.notify({ type: 'user', id: randomUUID() });
        expect(fired).toBe(false);
    });
});
