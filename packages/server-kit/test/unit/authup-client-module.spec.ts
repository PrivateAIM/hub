/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import { describe, expect, it } from 'vitest';
import {
    AuthupClientInjectionKey,
    AuthupClientModule,
    HTTPClientTimeout,
} from '../../src';

describe('AuthupClientModule', () => {
    it('should bound every request of the authup client', async () => {
        const container = new Container();

        await new AuthupClientModule({ baseURL: 'http://authup.test/' }).setup(container);

        expect(container.resolve(AuthupClientInjectionKey).toOptions().timeout).toBe(HTTPClientTimeout.AUTHUP);
    });

    it('should leave the client unbound without an Authup URL', async () => {
        const container = new Container();

        await new AuthupClientModule().setup(container);

        expect(container.tryResolve(AuthupClientInjectionKey).success).toBe(false);
    });
});
