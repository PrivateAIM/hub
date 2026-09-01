/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { serializedTextTransformer } from '../../src/transformer/serialized-text.ts';

describe('serializedTextTransformer', () => {
    // THE regression: @authup/kit serialize() returns the STRINGS 'null' / 'undefined'.
    // `{}` must stay a value — EntityEventHandler writes exactly that.
    it('to() maps null and undefined to SQL NULL but keeps an empty object', () => {
        expect(serializedTextTransformer.to(null)).toBeNull();
        expect(serializedTextTransformer.to(undefined)).toBeNull();
        expect(serializedTextTransformer.to({})).toBe('{}');
    });

    // why no data backfill is needed
    it('from() normalizes legacy "null"/"undefined" text and SQL NULL to null', () => {
        expect(serializedTextTransformer.from('null')).toBeNull();
        expect(serializedTextTransformer.from('undefined')).toBeNull();
        expect(serializedTextTransformer.from(null)).toBeNull();
    });

    // false / 0 pin `?? null` rather than `||`; the raw string pins serialize over JSON.stringify
    it('round-trips real values unchanged, incl. falsy ones and a raw base64 string', () => {
        const values: unknown[] = [{ a: 1 }, [{ position: 'after' }], {}, 'YmFzZTY0', false, 0];
        for (const value of values) {
            expect(serializedTextTransformer.from(serializedTextTransformer.to(value))).toEqual(value);
        }
    });
});
