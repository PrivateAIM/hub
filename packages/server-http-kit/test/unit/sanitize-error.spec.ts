/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isBadRequestError, isHubError, isInternalError } from '@privateaim/errors';
import { defineIssueItem } from '@ebec/core';
import {
    CodecError,
    ErrorCode,
    FiltersParseError,
    ParseError,
    SchemaError,
    buildIssue,
} from '@rapiq/core';
import { ValidupError } from 'validup';
import { describe, expect, it } from 'vitest';
import { sanitizeError } from '../../src/core';

describe('core/error/sanitize', () => {
    it('should map a rapiq parse error to a bad request error', () => {
        const input = FiltersParseError.keyNotPermitted('approvalStatus');

        const output = sanitizeError(input);

        expect(isBadRequestError(output)).toBeTruthy();
        expect(output.message).toEqual('The key approvalStatus is not permitted.');
    });

    it('should carry the rapiq parse trace onto the bad request error', () => {
        // Since @rapiq/core 2.2 a parse collects every violation and raises one
        // aggregate whose message is only a count, so the trace is the only
        // thing that names the rejected keys. Dropping it would answer a
        // malformed query with `The input was rejected: 2 violations.` and
        // nothing else.
        const input = ParseError.inputRejected([
            buildIssue({
                code: ErrorCode.KEY_NOT_ALLOWED,
                parameter: 'filters',
                key: 'publicKey',
                path: ['publicKey'],
                message: 'The key publicKey is not permitted.',
            }),
            buildIssue({
                code: ErrorCode.KEY_NOT_ALLOWED,
                parameter: 'sorts',
                key: 'secret',
                path: ['secret'],
                message: 'The key secret is not permitted.',
            }),
        ]);

        const output = sanitizeError(input);

        expect(isBadRequestError(output)).toBeTruthy();
        expect(output.issues).toHaveLength(2);
        expect(output.issues.map((issue) => issue.path)).toEqual([['publicKey'], ['secret']]);
    });

    it('should serialize the parse trace into the wire payload', () => {
        // `issues` reaches the client through the error middleware, which reads
        // it straight off the sanitized error — so an issue-less error must not
        // emit the key, and a traced one must.
        const traced = sanitizeError(ParseError.inputRejected([
            buildIssue({
                code: ErrorCode.KEY_NOT_ALLOWED,
                parameter: 'filters',
                key: 'publicKey',
                path: ['publicKey'],
                message: 'The key publicKey is not permitted.',
            }),
        ]));

        const payload = JSON.parse(JSON.stringify(traced));

        expect(payload.issues).toHaveLength(1);
        expect(payload.issues[0]).toMatchObject({
            code: ErrorCode.KEY_NOT_ALLOWED,
            path: ['publicKey'],
        });

        expect(JSON.parse(JSON.stringify(sanitizeError(new Error('boom')))).issues)
            .toBeUndefined();
    });

    it('should map a rapiq syntax error to a bad request error', () => {
        const input = ParseError.syntaxInvalid();

        const output = sanitizeError(input);

        expect(isBadRequestError(output)).toBeTruthy();
    });

    it('should map a rapiq codec error to a bad request error', () => {
        const input = CodecError.notResolvable('bogus');

        const output = sanitizeError(input);

        expect(isBadRequestError(output)).toBeTruthy();
    });

    it('should keep non-decode rapiq errors internal', () => {
        const input = new SchemaError('The schema foo could not be resolved.');

        const output = sanitizeError(input);

        expect(isInternalError(output)).toBeTruthy();
    });

    /**
     * The pass-through branch of `sanitizeError` is `isHubError` — a foreign
     * error matching it would be answered with the foreign error's own `code`,
     * which `httpStatusFromCode` does not know and collapses to 400. Both
     * `@ebec/core`'s BaseError and rapiq's ParseError now carry an `issues`
     * array (rapiq 2.2), so shape alone no longer separates them; only the
     * `@instanceof` chain does.
     */
    it('should not mistake a foreign ebec error for a hub error', () => {
        const input = FiltersParseError.keyNotPermitted('approvalStatus');

        expect(Array.isArray(input.issues)).toBeTruthy();
        expect(isHubError(input)).toBeFalsy();
        expect(sanitizeError(input)).not.toBe(input);
    });

    it('should carry validup issues onto the bad request error', () => {
        const issue = defineIssueItem({
            path: ['name'],
            message: 'The name is invalid.',
        });

        const output = sanitizeError(new ValidupError([issue]));

        expect(isBadRequestError(output)).toBeTruthy();
        expect(output.issues).toEqual([issue]);
    });

    it('should recognise a hub error rehydrated from its JSON form', () => {
        const output = sanitizeError(new ValidupError([]));

        // The `@instanceof` chain serializes to its description strings, so a
        // hub error survives an HTTP hop between services and is still
        // recognised — and passed through — on the far side.
        const rehydrated = JSON.parse(JSON.stringify(output));

        expect(isHubError(rehydrated)).toBeTruthy();
        expect(isBadRequestError(rehydrated)).toBeTruthy();
    });

    it('should keep unknown errors internal', () => {
        const output = sanitizeError(new Error('boom'));

        expect(isInternalError(output)).toBeTruthy();
        expect(output.message).toEqual('boom');
    });
});
