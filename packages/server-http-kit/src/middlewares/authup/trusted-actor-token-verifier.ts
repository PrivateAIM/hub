/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ITokenVerifier,
    TokenVerificationData,
    TokenVerifyOptions,
} from '@authup/server-adapter-kit';
import { HubError, UnauthorizedError } from '@privateaim/errors';
import { isObject } from '@privateaim/kit';

/**
 * Accepts a capability token only when the trusted client exchanged it
 * (`act.sub`). Authup lets any client holding a token-exchange capability
 * for an audience mint tokens for it, so the audience alone does not say
 * that the delegating service judged the request.
 *
 * The trusted client id is resolved once; a failed resolution answers 502
 * and is retried on the next request.
 */
export class TrustedActorTokenVerifier implements ITokenVerifier {
    protected verifier: ITokenVerifier;

    protected resolveClientId: () => Promise<string>;

    protected clientId: Promise<string> | undefined;

    constructor(verifier: ITokenVerifier, resolveClientId: () => Promise<string>) {
        this.verifier = verifier;
        this.resolveClientId = resolveClientId;
    }

    async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        const data = await this.verifier.verify(token, options);

        const actorId = isObject(data.act) ? data.act.sub : undefined;

        if (typeof actorId !== 'string' || actorId !== await this.resolveTrustedClientId()) {
            throw new UnauthorizedError('The capability token was not exchanged by a trusted client.');
        }

        return data;
    }

    protected resolveTrustedClientId(): Promise<string> {
        if (!this.clientId) {
            this.clientId = this.resolveClientId().catch((e: unknown) => {
                this.clientId = undefined;

                throw new HubError({
                    code: 'upstream_error',
                    status: 502,
                    message: 'The trusted capability client could not be resolved.',
                    cause: e,
                });
            });
        }

        return this.clientId;
    }
}
