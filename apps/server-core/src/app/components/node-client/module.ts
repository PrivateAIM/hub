/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ScheduledTask } from 'node-cron';
import cron from 'node-cron';
import { NODE_CLIENT_SYNC_SCHEDULE } from './constants.ts';
import { syncNodeClientPermissions } from './sync.ts';
import type { NodeClientComponent, NodeClientComponentContext } from './types.ts';

/**
 * Keeps every node client's Authup permissions up to date: one pass at start,
 * then on NODE_CLIENT_SYNC_SCHEDULE. The node subscriber only re-syncs on
 * node create or on a node save that changes a field, so without this a
 * permission a release adds (node_read) never reaches existing node clients.
 */
export function createNodeClientComponent(ctx: NodeClientComponentContext): NodeClientComponent {
    let task: ScheduledTask | undefined;
    let stopped = false;
    let lastSuccessAt: number | undefined;
    let runningSince: number | undefined;

    // A failed pass must never take the process down (start() is
    // fire-and-forget); the next tick simply retries.
    const execute = async () => {
        runningSince = Date.now();
        try {
            const { synced, failed } = await ctx.lock(() => syncNodeClientPermissions(ctx));

            if (failed > 0) {
                ctx.logger?.error(`Synced the permissions of ${synced} node clients, ${failed} failed.`);
            } else {
                lastSuccessAt = Date.now();
                ctx.logger?.debug(`Synced the permissions of ${synced} node clients.`);
            }
        } catch (e) {
            ctx.logger?.error(`Syncing the node client permissions failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            runningSince = undefined;
        }
    };

    return {
        async start() {
            await execute();

            if (stopped) {
                return;
            }

            task = cron.schedule(NODE_CLIENT_SYNC_SCHEDULE, async () => {
                await execute();
            }, { noOverlap: true });
        },
        async stop() {
            stopped = true;

            if (task) {
                await task.stop();
                task = undefined;
            }
        },
        status: () => ({ lastSuccessAt, runningSince }),
    };
}
