/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { runHealthChecks } from './check';
import type {
    HealthOptions,
    HealthReport,
    IHealth,
    IHealthCheck,
} from './types';

/**
 * The state behind `GET /livez` and `GET /readyz`.
 *
 * - Both fail until every module finished its setup (`markStarted`).
 * - `/livez` otherwise fails only on its own checks; a dependency outage is
 *   not one, since a restart does not fix it.
 * - `/readyz` fails on a failing readiness check and from the stop signal on.
 */
export class Health implements IHealth {
    protected _started = false;

    protected _stopping = false;

    protected liveness: IHealthCheck[];

    protected readiness: IHealthCheck[];

    protected onReadinessChange?: (failing: string[]) => void;

    protected previous = '';

    constructor(options: HealthOptions = {}) {
        this.liveness = options.liveness ?? [];
        this.readiness = options.readiness ?? [];
        this.onReadinessChange = options.onReadinessChange;
    }

    get started(): boolean {
        return this._started;
    }

    get stopping(): boolean {
        return this._stopping;
    }

    markStarted(): void {
        this._started = true;
    }

    markStopping(): void {
        this._stopping = true;
    }

    async checkLiveness(): Promise<HealthReport> {
        return runHealthChecks([this.createStartupCheck(), ...this.liveness]);
    }

    async checkReadiness(): Promise<HealthReport> {
        const report = await runHealthChecks([
            this.createStartupCheck(),
            ...this.readiness,
            { name: 'shutdown', run: () => !this._stopping },
        ]);

        this.observe(report);

        return report;
    }

    protected createStartupCheck(): IHealthCheck {
        return { name: 'startup', run: () => this._started };
    }

    /** Probes arrive every few seconds: report a change, not every failure. */
    protected observe(report: HealthReport): void {
        if (!this.onReadinessChange || !this._started) {
            return;
        }

        const failing = report.checks
            .filter((check) => !check.ok)
            .map((check) => check.name);
        const current = failing.join(',');

        if (current === this.previous) {
            return;
        }

        this.previous = current;
        this.onReadinessChange(failing);
    }
}
