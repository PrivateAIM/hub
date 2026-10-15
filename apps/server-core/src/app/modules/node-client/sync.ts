/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeClientPermissionSyncContext, NodeClientPermissionSyncResult } from './types.ts';

/**
 * Re-grant every existing node client its permissions. The node subscriber
 * only does so on node create or on a node save that changes a field, so a
 * permission a release adds (node_read) would otherwise never reach the
 * clients of nodes that already exist.
 *
 * A failing node is logged and skipped: one deleted Authup client must not
 * keep the others from their grants, nor keep the hub from booting.
 */
export async function syncNodeClientPermissions(
    ctx: NodeClientPermissionSyncContext,
): Promise<NodeClientPermissionSyncResult> {
    const nodes = await ctx.repository.findManyBy({});

    const result: NodeClientPermissionSyncResult = { synced: 0, failed: 0 };
    for (const node of nodes) {
        if (!node.clientId) {
            continue;
        }

        try {
            await ctx.nodeClientService.assignPermissions(node.clientId);
            result.synced++;
        } catch (e) {
            result.failed++;
            ctx.logger?.error(`Could not sync the permissions of the client of node ${node.name}: ${e instanceof Error ? e.message : String(e)}`, {
                nodeId: node.id,
                clientId: node.clientId,
            });
        }
    }

    return result;
}
