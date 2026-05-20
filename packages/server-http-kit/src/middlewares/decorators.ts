/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { decorators } from '@routup/decorators';
import type { App } from 'routup';
import type { MiddlewareDecoratorsOptions } from './types';

export function mountDecoratorsMiddleware(app: App, options: MiddlewareDecoratorsOptions) {
    app.use(decorators({ controllers: options.controllers }));
}
