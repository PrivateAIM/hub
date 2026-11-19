/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClassType } from '@routup/decorators';
import type { TrustProxy } from '@privateaim/server-kit';
import type { AuthorizationMiddlewareRegistrationOptions } from './authup';

export type MiddlewareSwaggerOptions = {
    cwd?: string,
    baseURL?: string
};

export type MiddlewareDecoratorsOptions = {
    controllers: (ClassType | Record<string, any>)[]
};

export type MiddlewareRateLimitOptions = {
    /**
     * The app's TRUST_PROXY as configured (unset: every hop is trusted). The
     * failed-authentication stage blocks whole addresses, so it runs only
     * when the address cannot be forged through `X-Forwarded-For`.
     */
    trustProxy?: TrustProxy,
};

export type MiddlewareMountOptions = {
    authorization?: AuthorizationMiddlewareRegistrationOptions,
    basic?: boolean,
    cors?: boolean,
    decorators?: MiddlewareDecoratorsOptions,
    prometheus?: boolean,
    rateLimit?: boolean | MiddlewareRateLimitOptions,
    swagger?: MiddlewareSwaggerOptions | boolean,
};
