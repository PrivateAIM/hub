/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    formatCapabilityEntry,
    parseCapabilityEntries,
    parseCapabilityEntry,
} from '../../src';

describe('parseCapabilityEntry', () => {
    it('parses type, id and actions', () => {
        expect(parseCapabilityEntry('bucket:7d2a:read,write')).toEqual({
            type: 'bucket',
            id: '7d2a',
            actions: ['read', 'write'],
        });
    });

    it.each([
        'bucket:7d2a',
        'bucket:7d2a:read:x',
        'Bucket:1:read',
        'bucket:a b:read',
        'bucket:1:read,read',
        'bucket:1:',
        `bucket:${'a'.repeat(129)}:read`,
    ])('throws on %s', (value) => {
        expect(() => parseCapabilityEntry(value)).toThrow(TypeError);
    });

    it('round-trips through formatCapabilityEntry', () => {
        const value = 'bucket-file:F.1_x-y:read,delete';

        expect(formatCapabilityEntry(parseCapabilityEntry(value))).toBe(value);
    });
});

describe('parseCapabilityEntries', () => {
    it('parses a list', () => {
        expect(parseCapabilityEntries(['bucket:1:read', 'bucket:2:write'])).toHaveLength(2);
    });

    it('throws on more than 32 entries', () => {
        const values = Array.from({ length: 33 }, (_, i) => `bucket:${i}:read`);

        expect(() => parseCapabilityEntries(values)).toThrow(TypeError);
    });

    it('accepts exactly 32 entries', () => {
        const values = Array.from({ length: 32 }, (_, i) => `bucket:${i}:read`);

        expect(parseCapabilityEntries(values)).toHaveLength(32);
    });

    it('throws on a duplicate entry', () => {
        expect(() => parseCapabilityEntries(['bucket:1:read', 'bucket:1:read'])).toThrow(TypeError);
    });

    it('throws when the joined string exceeds 4096 bytes', () => {
        const values = Array.from({ length: 30 }, (_, i) => `bucket:${String(i).padStart(2, '0')}${'a'.repeat(124)}:read`);

        expect(values.join(' ').length).toBeGreaterThan(4096);
        expect(() => parseCapabilityEntries(values)).toThrow(TypeError);
    });
});
