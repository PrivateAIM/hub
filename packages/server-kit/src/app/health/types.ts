/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface IHealthCheck {
    name: string;
    run(): boolean | Promise<boolean>;
}

export type HealthCheckResult = {
    name: string,
    ok: boolean,
};

/** The body of `GET /livez` and `GET /readyz`: check names and outcomes, never error text. */
export type HealthReport = {
    healthy: boolean,
    checks: HealthCheckResult[],
};

export interface IHealth {
    readonly started: boolean;
    readonly stopping: boolean;

    /** Every module finished its setup: both probes may pass from now on. */
    markStarted(): void;

    /** The stop signal arrived: readiness fails from now on, liveness does not. */
    markStopping(): void;

    checkLiveness(): Promise<HealthReport>;
    checkReadiness(): Promise<HealthReport>;
}

export type HealthOptions = {
    /** Checks only a restart remedies. Never a shared dependency. */
    liveness?: IHealthCheck[],
    /** Dependencies without which the process cannot serve a request. */
    readiness?: IHealthCheck[],
    /** Called with the failing readiness check names whenever that set changes. */
    onReadinessChange?: (failing: string[]) => void,
};

/** The part of a TypeORM `DataSource` a database check needs. */
export interface IHealthQueryable {
    query(sql: string): Promise<unknown>;
}

export type DatabaseHealthCheckOptions = {
    /** Milliseconds the database has to answer. */
    timeout?: number,
    /** Milliseconds a result is reused, so frequent probes add no load. */
    ttl?: number,
};
