/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { IScheduledComponent } from 'hubwire';
import { defineScheduledComponent } from 'hubwire';
import { NODE_OFFLINE_SCHEDULE } from './constants.ts';
import type { NodeOfflineComponentContext } from './types.ts';

/**
 * Clears `online` on nodes that stopped reporting, on NODE_OFFLINE_SCHEDULE.
 * A failed pass is logged and rethrown.
 */
export function createNodeOfflineComponent(ctx: NodeOfflineComponentContext): IScheduledComponent {
    return defineScheduledComponent({
        schedule: NODE_OFFLINE_SCHEDULE,
        run: async () => {
            let ids: string[];

            try {
                ids = await ctx.service.markStaleNodesOffline();
            } catch (e) {
                ctx.logger?.error(`Marking silent nodes offline failed: ${Error.isError(e) ? e.message : String(e)}`);

                throw e;
            }

            if (ids.length === 0) {
                return;
            }

            ctx.logger?.info(`Marked ${ids.length} ${ids.length === 1 ? 'node' : 'nodes'} offline`);

            for (const id of ids) {
                ctx.logger?.info('Marked node offline', {
                    [LogFlag.REF_TYPE]: DomainType.NODE,
                    [LogFlag.REF_ID]: id,
                });
            }
        },
    });
}
