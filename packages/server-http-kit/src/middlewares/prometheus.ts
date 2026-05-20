/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { prometheus } from '@routup/prometheus';
import type { App } from 'routup';

export function mountPrometheusMiddleware(app: App) {
    app.use(prometheus());
}
