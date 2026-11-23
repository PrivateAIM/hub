/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HEALTH_LIVENESS_PATH, HEALTH_READINESS_PATH } from '@privateaim/server-kit';
import type { HealthReport, IHealth } from '@privateaim/server-kit';
import type { App, IAppEvent } from 'routup';
import { defineCoreHandler } from 'routup';

function send(event: IAppEvent, report: HealthReport): HealthReport {
    event.response.status = report.healthy ? 200 : 503;
    event.response.headers.set('cache-control', 'no-store');

    return report;
}

/**
 * `GET /livez` and `GET /readyz` (`HEAD` falls through to `GET`). Mount them
 * before every middleware, so a probe is neither authenticated, rate limited
 * nor counted by the metrics middleware.
 */
export function mountHealthRoutes(app: App, health: IHealth): void {
    app.get(HEALTH_LIVENESS_PATH, defineCoreHandler(async (event) => send(event, await health.checkLiveness())));
    app.get(HEALTH_READINESS_PATH, defineCoreHandler(async (event) => send(event, await health.checkReadiness())));
}
