/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ParseError } from '@rapiq/core';
import { describe, expect, it } from 'vitest';
import { nodeSchema } from '../../../../src/core/entities/node/schema.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';

// Since @rapiq/core 2.0.0-beta.17, a key path containing a `__proto__`,
// `constructor` or `prototype` segment raises a typed ParseError instead of
// being accepted — on every query parameter, wherever in the path the segment
// sits. These tests pin that hardening at hub's decode seam. The error TYPE is
// part of the contract: `sanitizeError` (server-http-kit) maps ParseError to a
// 400 while anything unrecognized becomes an opaque 500 — the wire half is
// pinned by `test/unit/http/query-decode-guard.spec.ts`.

const decode = (input: unknown) => () => decodeQuery(input, { schema: nodeSchema });

describe('core/query key-path guard', () => {
    it('rejects a __proto__ filter key path', () => {
        expect(decode({ filter: { '__proto__.x': '1' } })).toThrowError(ParseError);
    });

    it('rejects a bare __proto__ own-property filter key', () => {
        // An object-literal `__proto__` key is neutralized by JS itself, but
        // JSON.parse (and qs-style parsers) create it as an OWN property — the
        // shape a hostile request body/query actually arrives in.
        const malicious = JSON.parse('{"filter": {"__proto__": {"x": "1"}}}');
        expect(Object.prototype.hasOwnProperty.call(malicious.filter, '__proto__')).toBe(true);

        expect(decode(malicious)).toThrowError(ParseError);
    });

    it('rejects a constructor/prototype filter key path', () => {
        expect(decode({ filter: { 'constructor.prototype.x': '1' } })).toThrowError(ParseError);
        expect(decode({ filter: { 'prototype.x': '1' } })).toThrowError(ParseError);
    });

    it('rejects a mid-path __proto__ segment', () => {
        expect(decode({ filter: { 'a.__proto__.b': '1' } })).toThrowError(ParseError);
    });

    it('rejects a __proto__ sort path', () => {
        expect(decode({ sort: '__proto__.x' })).toThrowError(ParseError);
        expect(decode({ sort: 'constructor' })).toThrowError(ParseError);
    });

    it('rejects a __proto__ fields selection', () => {
        expect(decode({ fields: '__proto__' })).toThrowError(ParseError);
    });

    it('rejects a __proto__ include path', () => {
        expect(decode({ include: '__proto__.x' })).toThrowError(ParseError);
    });

    it('rejects the raw query-string form', () => {
        expect(decode('filter[__proto__.x]=1')).toThrowError(ParseError);
    });

    it('leaves Object.prototype untouched by any attempt', () => {
        // Negative control for the suite: none of the rejected inputs above may
        // have polluted the prototype as a side effect of parsing-then-throwing.
        const probe: Record<string, unknown> = {};
        expect(probe.x).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'x')).toBe(false);
    });
});
