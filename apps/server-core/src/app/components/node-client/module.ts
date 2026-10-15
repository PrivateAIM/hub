/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IComponent } from 'ergos';
import { defineScheduledComponent } from 'ergos';
import { NODE_CLIENT_SYNC_SCHEDULE } from './constants.ts';
import { syncNodeClientPermissions } from './sync.ts';
import type { NodeClientComponentContext, NodeClientPermissionSyncResult } from './types.ts';

/**
 * Keeps every node client's Authup permissions up to date: one pass at start,
 * then on NODE_CLIENT_SYNC_SCHEDULE. The node subscriber only re-syncs on
 * node create or on a node save that changes a field, so without this a
 * permission a release adds (node_read) never reaches existing node clients.
 *
 * A pass throws (after logging) whenever a node failed, so lastSuccessAt is
 * stamped only for a clean pass. No logger is handed to the scheduled
 * component: run() already logs at error level.
 */
export function createNodeClientComponent(ctx: NodeClientComponentContext): IComponent {
    return defineScheduledComponent({
        name: 'node-client',
        schedule: NODE_CLIENT_SYNC_SCHEDULE,
        run: async () => {
            let result: NodeClientPermissionSyncResult;
            try {
                result = await ctx.lock(() => syncNodeClientPermissions(ctx));
            } catch (e) {
                ctx.logger?.error(`Syncing the node client permissions failed: ${e instanceof Error ? e.message : String(e)}`);
                throw e;
            }

            const { synced, failed } = result;
            if (failed > 0) {
                ctx.logger?.error(`Synced the permissions of ${synced} node clients, ${failed} failed.`);
                throw new Error(`${failed} node clients failed to sync.`);
            }

            ctx.logger?.debug(`Synced the permissions of ${synced} node clients.`);
        },
    });
}
