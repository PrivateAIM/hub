/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { DatabaseInjectionKey } from '../database/index.ts';

/** How often expired messages are swept from the mailbox. */
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Periodically deletes expired messages from the durable mailbox — rows whose
 * absolute `expires_at` (stamped at send time) has passed.
 */
export class SweeperModule implements IModule {
    readonly name = 'sweeper';

    readonly dependencies: string[] = ['database'];

    private timer: ReturnType<typeof setInterval> | undefined;

    async setup(container: IContainer): Promise<void> {
        const repository = container.resolve(DatabaseInjectionKey.MessageRepository);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;

        let inFlight = false;
        this.timer = setInterval(() => {
            // skip this tick if the previous sweep is still running (avoid pile-up)
            if (inFlight) {
                return;
            }

            inFlight = true;
            repository.deleteExpired(new Date())
                .then((removed) => {
                    if (removed > 0) {
                        logger?.debug(`Swept ${removed} expired message(s)`);
                    }
                })
                .catch((error) => {
                    logger?.error(error);
                })
                .finally(() => {
                    inFlight = false;
                });
        }, SWEEP_INTERVAL_MS);

        // do not keep the process alive solely for the sweep timer
        if (typeof this.timer.unref === 'function') {
            this.timer.unref();
        }
    }

    async teardown(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}
