/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { assertBucketRefPairing } from '../../src/domains/bucket/validator.ts';

describe('assertBucketRefPairing', () => {
    it('should accept both refType and refId set', () => {
        expect(() => assertBucketRefPairing({ refType: 'analysis', refId: 'analysis-1' })).not.toThrow();
    });

    it('should accept both refType and refId absent', () => {
        expect(() => assertBucketRefPairing({})).not.toThrow();
    });

    it('should accept both refType and refId null', () => {
        expect(() => assertBucketRefPairing({ refType: null, refId: null })).not.toThrow();
    });

    it('should accept refType set without refId', () => {
        expect(() => assertBucketRefPairing({ refType: 'analysis' })).not.toThrow();
    });

    it('should reject refId set without refType', () => {
        expect(() => assertBucketRefPairing({ refId: 'analysis-1' })).toThrow(BadRequestError);
    });

    it('should reject refId set with refType null', () => {
        expect(() => assertBucketRefPairing({ refType: null, refId: 'analysis-1' })).toThrow(BadRequestError);
    });
});
