/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isBadRequestError, isInternalError } from '@privateaim/errors';
import {
    CodecError,
    FiltersParseError,
    ParseError,
    SchemaError,
} from '@rapiq/core';
import { describe, expect, it } from 'vitest';
import { sanitizeError } from '../../src/core';

describe('core/error/sanitize', () => {
    it('should map a rapiq parse error to a bad request error', () => {
        const input = FiltersParseError.keyNotPermitted('approvalStatus');

        const output = sanitizeError(input);

        expect(isBadRequestError(output)).toBeTruthy();
        expect(output.message).toEqual('The key approvalStatus is not permitted.');
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

    it('should keep unknown errors internal', () => {
        const output = sanitizeError(new Error('boom'));

        expect(isInternalError(output)).toBeTruthy();
        expect(output.message).toEqual('boom');
    });
});
