/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import {
    ErrorCode,
    PermissionDeniedError,
    httpStatusFromCode,
} from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { buildSocketSubscribeError } from '../../../../src/adapters/socket/error.ts';

describe('adapters/socket/error', () => {
    it('should answer an authup or hub permission denial with a 403 permission denied error', () => {
        for (const denial of [PermissionError.evaluationFailed('foo'), new PermissionDeniedError()]) {
            const error = buildSocketSubscribeError(denial);
            expect(error).toBeInstanceOf(PermissionDeniedError);
            expect(httpStatusFromCode(error.code)).toBe(403);
        }
    });

    it('should answer any other failure with an internal error that hides its details', () => {
        const error = buildSocketSubscribeError(new Error('catalog unreachable: secret detail'));
        expect(JSON.parse(JSON.stringify(error))).toMatchObject({ code: ErrorCode.INTERNAL_ERROR });
        expect(JSON.stringify(error)).not.toContain('secret detail');
    });
});
