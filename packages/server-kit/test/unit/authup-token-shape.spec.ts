/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { assertIntrospectableToken, isIntrospectableToken } from '../../src/authup/token-shape.ts';

// A structurally valid compact JWS (header.payload.signature); never verified.
const jws = [
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    'c2lnbmF0dXJlLXZhbHVlLXdpdGgtdXJsLXNhZmUtY2hhcnNfLQ',
].join('.');

describe('isIntrospectableToken', () => {
    it('accepts a compact JWS', () => {
        expect(isIntrospectableToken(jws)).toBe(true);
    });

    it.each([
        ['a short garbage string', 'not-a-token'],
        ['a JWS-shaped token shorter than authup accepts', 'a.b.c'],
        ['a JWS-shaped token of 15 characters', 'aaaaa.aaaaa.aaa'],
        ['an empty string', ''],
        ['two segments', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0'],
        ['four segments', `${jws}.extra`],
        ['an empty segment', 'eyJhbGciOiJIUzI1NiJ9..c2lnbmF0dXJl'],
        ['non-base64url characters', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIi+In0/.c2lnbmF0dXJl'],
        ['whitespace', `${jws} `],
        ['a JWS-shaped token longer than authup accepts', `${jws}${'a'.repeat(2048)}`],
    ])('refuses %s', (_label, token) => {
        expect(isIntrospectableToken(token)).toBe(false);
    });

    it('accepts the exact length bounds authup accepts', () => {
        expect(isIntrospectableToken('aaaaa.aaaaa.aaaa')).toBe(true);
        expect(isIntrospectableToken(`aaaaa.aaaaa.${'a'.repeat(2048 - 12)}`)).toBe(true);
        expect(isIntrospectableToken(`aaaaa.aaaaa.${'a'.repeat(2048 - 11)}`)).toBe(false);
    });

    it('refuses a non-string', () => {
        expect(isIntrospectableToken(undefined)).toBe(false);
        expect(isIntrospectableToken(42)).toBe(false);
    });
});

describe('assertIntrospectableToken', () => {
    it('throws UnauthorizedError for a malformed credential', () => {
        expect(() => assertIntrospectableToken('not-a-token')).toThrow(UnauthorizedError);
    });

    it('passes a compact JWS through', () => {
        expect(() => assertIntrospectableToken(jws)).not.toThrow();
    });
});
