/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum EnvironmentName {
    TEST = 'test',
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

/**
 * Deadline in milliseconds of one outbound HTTP request (hapic `timeout`),
 * per kind of peer. It covers dispatch and reading the response body, so a
 * call that streams a request or response body passes `timeout: 0`.
 */
export const HTTPClientTimeout = {
    /**
     * Authup REST and OAuth2 token requests; matches authup's own
     * token-verifier default (10 s).
     */
    AUTHUP: 10_000,
    /**
     * Hub services (core, storage, telemetry) and GitHub.
     */
    SERVICE: 30_000,
    /**
     * Harbor answers repository and artifact copies synchronously.
     */
    HARBOR: 60_000,
    /**
     * VictoriaLogs ingest and query.
     */
    VICTORIA_LOGS: 30_000,
} as const;

