/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { resolveAccessTokenCookieName } from '../../../../src/middlewares/authup/utils.ts';

describe('resolveAccessTokenCookieName', () => {
    it('returns the bare cookie name when no prefix is configured', () => {
        expect(resolveAccessTokenCookieName()).toBe('access_token');
        expect(resolveAccessTokenCookieName('')).toBe('access_token');
        expect(resolveAccessTokenCookieName(undefined)).toBe('access_token');
    });

    it('namespaces the cookie name with the configured prefix', () => {
        expect(resolveAccessTokenCookieName('flame_')).toBe('flame_access_token');
    });
});
