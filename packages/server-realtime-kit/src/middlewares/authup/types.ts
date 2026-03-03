/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenVerifier } from '@authup/server-adapter-kit';

export type AuthorizationMiddlewareRegistrationOptions = {
    tokenVerifier: TokenVerifier,
    baseURL?: string,
    fakeAbilities?: boolean
};
