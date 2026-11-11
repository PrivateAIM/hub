/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupTokenExchangeContext } from '@privateaim/server-kit';
import { exchangeAuthupToken } from '@privateaim/server-kit';
import type { ICapabilityTokenIssuer } from '../../core/services/storage-capability/index.ts';

export class AuthupCapabilityTokenIssuer implements ICapabilityTokenIssuer {
    protected ctx: AuthupTokenExchangeContext;

    constructor(ctx: AuthupTokenExchangeContext) {
        this.ctx = ctx;
    }

    async issue(input: {
        subjectToken: string,
        audience: string,
        cap: string[],
        expiresIn: number
    }): Promise<{ token: string, expiresIn: number }> {
        const result = await exchangeAuthupToken(this.ctx, input);

        // Authup may omit expires_in (reported as 0); the requested lifetime is the ceiling.
        const expiresIn = Number.isFinite(result.expiresIn) && result.expiresIn > 0 ?
            result.expiresIn :
            input.expiresIn;

        return { token: result.token, expiresIn };
    }
}
