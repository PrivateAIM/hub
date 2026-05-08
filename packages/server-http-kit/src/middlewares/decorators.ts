/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { readRequestBody } from '@routup/basic/body';
import { useRequestCookie, useRequestCookies } from '@routup/basic/cookie';
import { useRequestQuery } from '@routup/basic/query';
import { decorators } from '@routup/decorators';
import type { Router } from 'routup';
import type { MiddlewareDecoratorsOptions } from './types';

export function mountDecoratorsMiddleware(router: Router, options: MiddlewareDecoratorsOptions) {
    router.use(decorators({
        controllers: options.controllers,
        parameter: {
            body: (context, name) => {
                if (name) {
                    return readRequestBody(context.event, name);
                }

                return readRequestBody(context.event);
            },
            cookie: (context, name) => {
                if (name) {
                    return useRequestCookie(context.event, name);
                }

                return useRequestCookies(context.event);
            },
            query: (context, name) => {
                if (name) {
                    return useRequestQuery(context.event, name);
                }

                return useRequestQuery(context.event);
            },
        },
    }));
}
