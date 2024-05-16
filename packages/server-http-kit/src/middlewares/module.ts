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
import type { MiddlewareRegistrationContext } from './types';

export function mountMiddlewares(router: Router, ctx: MiddlewareRegistrationContext) {
    ctx.basic ??= true;
    ctx.cors ??= true;
    ctx.prometheus ??= true;
    ctx.rateLimit ??= true;
    ctx.swagger ??= true;

    if (ctx.cors) {
        mountCorsMiddleware(router);
    }

    if (ctx.basic) {
        mountBasicMiddleware(router);
    }

    if (ctx.authup) {
        mountAuthupMiddleware(router, ctx.authup);
    }

    if (ctx.prometheus) {
        mountPrometheusMiddleware(router);
    }

    if (ctx.rateLimit) {
        mountRateLimiterMiddleware(router);
    }

    if (ctx.swagger) {
        mountSwaggerMiddleware(router, boolableToObject(ctx.swagger));
    }

    if (ctx.decorators) {
        mountDecoratorsMiddleware(router, ctx.decorators);
    }
}
