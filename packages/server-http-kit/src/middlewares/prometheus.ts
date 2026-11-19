/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { prometheus } from '@routup/prometheus';
import type { App } from 'routup';

export const PROMETHEUS_METRICS_PATH = '/metrics';

/**
 * The `path` label of a request no route handled (a 404, a rejected
 * preflight): one series instead of one per scanned URL.
 */
export const PROMETHEUS_UNMATCHED_PATH = '/{unmatched}';

export function mountPrometheusMiddleware(app: App) {
    app.use(prometheus({
        metricsPath: PROMETHEUS_METRICS_PATH,
        unmatchedPath: PROMETHEUS_UNMATCHED_PATH,
        skip: (event) => event.path === PROMETHEUS_METRICS_PATH,
    }));
}
