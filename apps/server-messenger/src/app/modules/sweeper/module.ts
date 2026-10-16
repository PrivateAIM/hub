/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IComponent } from 'hubwire';
import { defineScheduledComponent } from 'hubwire';
import type { IModule } from 'orkos';
import { LoggerInjectionKey, createScheduledComponentLogHooks } from '@privateaim/server-kit';
import { DatabaseInjectionKey } from '../database/index.ts';

/**
 * Deletes expired messages from the durable mailbox — rows whose absolute
 * `expiresAt` (stamped at send time) has passed — once a minute. A failing
 * sweep is logged and retried on the next tick; ticks never overlap.
 *
 * The cron task keeps the process alive (the old interval was unref'd), so
 * teardown() must stop it.
 */
export class SweeperModule implements IModule {
    readonly name = 'sweeper';

    readonly dependencies: string[] = ['database'];

    private component: IComponent | undefined;

    async setup(container: IContainer): Promise<void> {
        const repository = container.resolve(DatabaseInjectionKey.MessageRepository);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;

        this.component = defineScheduledComponent({
            schedule: '* * * * *',
            // as before: the first sweep runs one interval after boot
            runOnStart: false,
            hooks: logger ? createScheduledComponentLogHooks(logger, 'message-sweeper') : undefined,
            run: async () => {
                const removed = await repository.deleteExpired(new Date());
                if (removed > 0) {
                    logger?.debug(`Swept ${removed} expired message(s)`);
                }
            },
        });

        await this.component.start();
    }

    async teardown(): Promise<void> {
        const { component } = this;
        this.component = undefined;

        await component?.stop();
        // stop() never waits for a sweep in flight; it must finish before the database closes.
        await component?.settled?.();
    }
}
