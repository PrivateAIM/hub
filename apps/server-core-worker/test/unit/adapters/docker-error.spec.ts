/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    isDockerDistributionImageMissingError,
    isDockerErrorWithStatusCode,
    isDockerNotFoundError,
} from '../../../src/adapters/docker/error';

function createDockerError(statusCode?: number): Error {
    const error = new Error('(HTTP code) message');
    if (typeof statusCode !== 'undefined') {
        Object.assign(error, { statusCode });
    }
    return error;
}

describe('isDockerErrorWithStatusCode', () => {
    it('should match an error carrying the given status code', () => {
        expect(isDockerErrorWithStatusCode(createDockerError(404), 404)).toBe(true);
        expect(isDockerErrorWithStatusCode(createDockerError(500), 404)).toBe(false);
    });

    it('should not match connection errors without a status code', () => {
        expect(isDockerErrorWithStatusCode(createDockerError(), 404)).toBe(false);
    });

    it('should not match non-error values', () => {
        expect(isDockerErrorWithStatusCode({ statusCode: 404 }, 404)).toBe(false);
        expect(isDockerErrorWithStatusCode(undefined, 404)).toBe(false);
    });
});

describe('isDockerNotFoundError', () => {
    it('should match 404 only', () => {
        expect(isDockerNotFoundError(createDockerError(404))).toBe(true);
        expect(isDockerNotFoundError(createDockerError(401))).toBe(false);
        expect(isDockerNotFoundError(createDockerError())).toBe(false);
    });
});

describe('isDockerDistributionImageMissingError', () => {
    it('should match 401 (docker api: no image found or failed authentication)', () => {
        expect(isDockerDistributionImageMissingError(createDockerError(401))).toBe(true);
    });

    it('should match 404 defensively', () => {
        expect(isDockerDistributionImageMissingError(createDockerError(404))).toBe(true);
    });

    it('should not match server or connection failures', () => {
        expect(isDockerDistributionImageMissingError(createDockerError(500))).toBe(false);
        expect(isDockerDistributionImageMissingError(createDockerError())).toBe(false);
    });
});
