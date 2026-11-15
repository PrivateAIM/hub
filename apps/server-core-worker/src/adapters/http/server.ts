/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HEALTH_LIVENESS_PATH, HEALTH_READINESS_PATH } from '@privateaim/server-kit';
import type { HealthReport, IHealth } from '@privateaim/server-kit';
import type { IAppEvent } from 'routup';
import { App, defineCoreHandler } from 'routup';

function sendHealth(event: IAppEvent, report: HealthReport): HealthReport {
    event.response.status = report.healthy ? 200 : 503;
    event.response.headers.set('cache-control', 'no-store');

    return report;
}

export function createHttpApp(health: IHealth) : App {
    const app = new App();

    app.get('/', defineCoreHandler(() => ({ timestamp: Date.now() })));
    app.get(HEALTH_LIVENESS_PATH, defineCoreHandler(async (event) => sendHealth(event, await health.checkLiveness())));
    app.get(HEALTH_READINESS_PATH, defineCoreHandler(async (event) => sendHealth(event, await health.checkReadiness())));

    return app;
}
