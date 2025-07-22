/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Router } from 'routup';
import { mountAuthupMiddleware } from '../services';
import { boolableToObject } from '../utils';
import { mountBasicMiddleware } from './basic';
import { mountCorsMiddleware } from './cors';
import { mountDecoratorsMiddleware } from './decorators';
import { mountPrometheusMiddleware } from './prometheus';
import { mountRateLimiterMiddleware } from './rate-limit';
import { mountSwaggerMiddleware } from './swagger';
import type { MiddlewareMountOptions } from './types';

export function mountMiddlewares(
    router: Router,
    options: MiddlewareMountOptions = {},
) {
    if (options.cors) {
        mountCorsMiddleware(router);
    }

    if (options.basic) {
        mountBasicMiddleware(router);
    }

    if (options.authup) {
        mountAuthupMiddleware(router, options.authup);
    }

    if (options.prometheus) {
        mountPrometheusMiddleware(router);
    }

    if (options.rateLimit) {
        mountRateLimiterMiddleware(router);
    }

    if (options.swagger) {
        mountSwaggerMiddleware(router, boolableToObject(options.swagger));
    }

    if (options.decorators) {
        mountDecoratorsMiddleware(router, options.decorators);
    }
}
