/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { buildAuthupURL, selectGlobalPermission } from '../../src/authup-token.ts';

describe('authup-token', () => {
    it('should keep the path prefix of an AUTHUP_URL without a trailing slash', () => {
        expect(buildAuthupURL('http://host/auth', 'users').href).toEqual('http://host/auth/users');
        expect(buildAuthupURL('http://host/auth/', 'users').href).toEqual('http://host/auth/users');
        expect(buildAuthupURL('http://host/auth', '/token/introspect').href).toEqual('http://host/auth/token/introspect');
        expect(buildAuthupURL('http://host:3010', 'users').href).toEqual('http://host:3010/users');
    });

    it('should only ever pick the global permission', () => {
        const clientBound = {
            id: 'client-bound', 
            clientId: 'c', 
            realmId: null, 
        };
        const realmBound = {
            id: 'realm-bound', 
            clientId: null, 
            realmId: 'r', 
        };

        expect(selectGlobalPermission([clientBound, realmBound, {
            id: 'global', 
            clientId: null, 
            realmId: null, 
        }])?.id)
            .toEqual('global');
        expect(selectGlobalPermission([clientBound, realmBound])).toBeUndefined();
    });
});
