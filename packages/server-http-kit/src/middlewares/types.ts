/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClassType } from '@routup/decorators';
import type { AuthupMiddlewareRegistrationOptions } from '../services';

export type MiddlewareSwaggerOptions = {
    cwd?: string,
    baseURL?: string
};

export type MiddlewareDecoratorsOptions = {
    controllers: (ClassType | Record<string, any>)[]
};

export type MiddlewareMountOptions = {
    options?: MiddlewareSwaggerOptions,

    authup?: AuthupMiddlewareRegistrationOptions,
    basic?: boolean,
    cors?: boolean,
    decorators?: MiddlewareDecoratorsOptions,
    prometheus?: boolean,
    rateLimit?: boolean,
    swagger?: MiddlewareSwaggerOptions | boolean,
};
