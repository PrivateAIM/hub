/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { canonicalizeTrustProxy } from '../../src';

describe('canonicalizeTrustProxy', () => {
    it('reads an integer as a hop count, never as an address or a boolean', () => {
        expect(canonicalizeTrustProxy('1')).toBe(1);
        expect(canonicalizeTrustProxy(' 2 ')).toBe(2);
        expect(canonicalizeTrustProxy('0')).toBe(0);
    });

    it('reads the boolean words', () => {
        expect(canonicalizeTrustProxy('true')).toBe(true);
        expect(canonicalizeTrustProxy('YES')).toBe(true);
        expect(canonicalizeTrustProxy('off')).toBe(false);
    });

    it('reads anything else as a trimmed, lowercased allowlist', () => {
        expect(canonicalizeTrustProxy(' 10.0.0.0/8 , LOOPBACK,, ')).toEqual(['10.0.0.0/8', 'loopback']);
    });

    it('rejects a hop count past the safe integer range', () => {
        expect(() => canonicalizeTrustProxy('9'.repeat(400))).toThrow();
    });
});
