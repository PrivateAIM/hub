/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { ConfigInjectionKey } from '../../config/constants';
import type { Logger } from '../../logger/types';
import { HealthInjectionKey } from './constants';

/**
 * The `onSignal` of `startApplication` for a service with health routes:
 * `GET /readyz` answers 503 from the first stop signal on, and the answer is
 * the configured `shutdownDelay` (seconds) in milliseconds, which the
 * listeners keep serving before teardown so a load balancer drains them.
 */
export function createHealthShutdownHook(container: IContainer): () => number {
    return () => {
        const health = container.tryResolve(HealthInjectionKey);

        if (health.success) {
            health.data.markStopping();
        }

        const config = container.tryResolve(ConfigInjectionKey);

        if (!config.success) {
            return 0;
        }

        return (config.data.shutdownDelay ?? 0) * 1_000;
    };
}

export function createHealthLogObserver(logger: Logger): (failing: string[]) => void {
    return (failing) => {
        if (failing.length > 0) {
            logger.warn(`Not ready, GET /readyz answers 503. Failing checks: ${failing.join(', ')}.`);

            return;
        }

        logger.info('Ready again, GET /readyz answers 200.');
    };
}
