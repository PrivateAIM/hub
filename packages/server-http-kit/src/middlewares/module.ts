/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { App } from 'routup';
import { mountAuthorizationMiddleware } from './authup';
import { boolableToObject } from '../utils';
import { mountBasicMiddleware } from './basic';
import { mountCorsMiddleware } from './cors';
import { mountDecoratorsMiddleware } from './decorators';
import { mountPrometheusMiddleware } from './prometheus';
import { mountRateLimiterMiddleware } from './rate-limit';
import { mountSwaggerMiddleware } from './swagger';
import type { MiddlewareMountOptions } from './types';

export function mountMiddlewares(
    app: App,
    options: MiddlewareMountOptions = {},
) {
    if (options.cors) {
        mountCorsMiddleware(app);
    }

    if (options.basic) {
        mountBasicMiddleware(app);
    }

    if (options.authorization) {
        mountAuthorizationMiddleware(app, options.authorization);
    }

    if (options.prometheus) {
        mountPrometheusMiddleware(app);
    }

    if (options.rateLimit) {
        mountRateLimiterMiddleware(app);
    }

    if (options.swagger) {
        mountSwaggerMiddleware(app, boolableToObject(options.swagger));
    }

    if (options.decorators) {
        mountDecoratorsMiddleware(app, options.decorators);
    }
}
