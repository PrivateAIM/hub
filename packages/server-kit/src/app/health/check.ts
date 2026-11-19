/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DATABASE_HEALTH_CHECK_TIMEOUT, DATABASE_HEALTH_CHECK_TTL } from './constants';
import type {
    DatabaseHealthCheckOptions,
    HealthReport,
    IHealthCheck,
    IHealthQueryable,
} from './types';

export async function runHealthChecks(checks: IHealthCheck[]): Promise<HealthReport> {
    const results = await Promise.all(checks.map(async (check) => {
        let ok: boolean;

        try {
            ok = await check.run();
        } catch {
            ok = false;
        }

        return { name: check.name, ok };
    }));

    return {
        healthy: results.every((result) => result.ok),
        checks: results,
    };
}

/**
 * Fails when the database does not answer `SELECT 1` within `timeout`.
 * A query outliving the timeout still holds its connection, so no second
 * one is issued until it settles: probes during a stall must not pile
 * queries onto the pool.
 */
export function createDatabaseHealthCheck(
    source: IHealthQueryable,
    options: DatabaseHealthCheckOptions = {},
): IHealthCheck {
    const timeout = options.timeout ?? DATABASE_HEALTH_CHECK_TIMEOUT;
    const ttl = options.ttl ?? DATABASE_HEALTH_CHECK_TTL;

    let pending: Promise<boolean> | undefined;
    let last: { ok: boolean, at: number } | undefined;
    let query: Promise<boolean> | undefined;

    const ping = () => {
        if (!query) {
            const started = Promise.try(() => source.query('SELECT 1'))
                .then(() => true, () => false)
                .finally(() => {
                    if (query === started) {
                        query = undefined;
                    }
                });

            query = started;
        }

        const current = query;

        return new Promise<boolean>((resolve) => {
            const timer = setTimeout(() => resolve(false), timeout);

            timer.unref?.();

            current.then((ok) => {
                clearTimeout(timer);
                resolve(ok);
            });
        });
    };

    return {
        name: 'database',
        run: () => {
            if (last && Date.now() - last.at < ttl) {
                return last.ok;
            }

            if (!pending) {
                pending = ping().then((ok) => {
                    last = { ok, at: Date.now() };
                    pending = undefined;

                    return ok;
                });
            }

            return pending;
        },
    };
}
