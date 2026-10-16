/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { createScheduledComponentLogHooks } from '@privateaim/server-kit';
import type { IScheduledComponent } from 'hubwire';
import { defineScheduledComponent } from 'hubwire';
import type { IEventRepository } from '../../../core/entities/index.ts';

/**
 * Retention sweep: one pass at start, then daily at 01:00. A failing pass is
 * logged by the scheduled component and retried on the next tick.
 */
export function createEventCleanerComponent(ctx: { repository: IEventRepository, logger?: Logger }): IScheduledComponent {
    return defineScheduledComponent({
        schedule: '0 1 * * *',
        hooks: ctx.logger ? createScheduledComponentLogHooks(ctx.logger, 'event-cleaner') : undefined,
        run: async () => {
            // ISO-8601, because expiresAt is a varchar compared lexicographically.
            const isoDate = new Date().toISOString();

            ctx.logger?.info(`Removing expired event entities before ${isoDate}`);

            // Batching, the id-only select and the delete-by-id all live behind the
            // port — the sweep can match millions of rows after a retention change.
            const removed = await ctx.repository.deleteExpired(isoDate);

            if (removed > 0) {
                ctx.logger?.info(`Removed ${removed} expired event entities`);
            }
        },
    });
}
