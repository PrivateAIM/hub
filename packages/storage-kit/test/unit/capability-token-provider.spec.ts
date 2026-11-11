/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { StorageCapabilityTokenProvider } from '../../src';
import type { StorageCapabilityTokenMinter } from '../../src';

class FakeMinter {
    public calls : string[][] = [];

    public fail = false;

    public lifetimeMs = 3600 * 1000;

    constructor(private readonly clock: { now: number }) {}

    mint : StorageCapabilityTokenMinter = async (input) => {
        this.calls.push(input.cap);
        // let concurrent callers pile up
        await Promise.resolve();

        if (this.fail) {
            throw new Error('mint failed');
        }

        return {
            token: `token-${this.calls.length}`,
            expiresAt: new Date(this.clock.now + this.lifetimeMs).toISOString(),
        };
    };
}

function setup() {
    const clock = { now: Date.UTC(2026, 0, 1) };
    const minter = new FakeMinter(clock);
    const provider = new StorageCapabilityTokenProvider({
        mint: minter.mint,
        now: () => clock.now,
    });

    return {
        clock, 
        minter, 
        provider, 
    };
}

describe('StorageCapabilityTokenProvider', () => {
    it('should mint on the first call and reuse the token afterwards', async () => {
        const { minter, provider } = setup();

        expect(await provider.getToken(['bucket:a:read'])).toBe('token-1');
        expect(await provider.getToken(['bucket:a:read'])).toBe('token-1');
        expect(minter.calls).toHaveLength(1);
    });

    it('should re-mint 59 seconds before expiry but not 61 seconds before', async () => {
        const {
            clock, 
            minter, 
            provider, 
        } = setup();

        await provider.getToken(['bucket:a:read']);

        clock.now += (3600 - 61) * 1000;
        await provider.getToken(['bucket:a:read']);
        expect(minter.calls).toHaveLength(1);

        clock.now += 2 * 1000;
        expect(await provider.getToken(['bucket:a:read'])).toBe('token-2');
        expect(minter.calls).toHaveLength(2);
    });

    it('should share one mint between parallel calls', async () => {
        const { minter, provider } = setup();

        const tokens = await Promise.all([
            provider.getToken(['bucket:a:read']),
            provider.getToken(['bucket:a:read']),
        ]);

        expect(tokens).toEqual(['token-1', 'token-1']);
        expect(minter.calls).toHaveLength(1);
    });

    it('should not cache a rejected mint', async () => {
        const { minter, provider } = setup();

        minter.fail = true;
        await expect(provider.getToken(['bucket:a:read'])).rejects.toThrow('mint failed');

        minter.fail = false;
        expect(await provider.getToken(['bucket:a:read'])).toBe('token-2');
    });

    it('should keep separate tokens per cap set, independent of entry order', async () => {
        const { minter, provider } = setup();

        const a = await provider.getToken(['bucket:a:read']);
        const b = await provider.getToken(['bucket:b:read']);
        const ab = await provider.getToken(['bucket:a:read', 'bucket:b:read']);
        const ba = await provider.getToken(['bucket:b:read', 'bucket:a:read']);

        expect(new Set([a, b, ab]).size).toBe(3);
        expect(ba).toBe(ab);
        expect(minter.calls).toHaveLength(3);
    });

    it('should drop cached tokens on invalidate', async () => {
        const { provider } = setup();

        await provider.getToken(['bucket:a:read']);
        await provider.getToken(['bucket:b:read']);

        provider.invalidate(['bucket:a:read']);
        expect(await provider.getToken(['bucket:a:read'])).toBe('token-3');
        expect(await provider.getToken(['bucket:b:read'])).toBe('token-2');

        provider.invalidate();
        expect(await provider.getToken(['bucket:b:read'])).toBe('token-4');
    });
});
