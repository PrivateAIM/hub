/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { IComponent } from 'hubwire';

/**
 * Start components without blocking the caller (boot must not wait for a
 * background component's first pass), but never silently: a start that
 * rejects — e.g. a consume the broker refuses with a 406 or 403 — leaves a
 * consumer that never receives a message, and used to surface only as an
 * unhandled rejection. Each failure is logged at error level.
 *
 * Resolves once every start settled; it never rejects.
 */
export async function startComponentsInBackground(
    components: IComponent[],
    logger?: Logger,
): Promise<void> {
    const results = await Promise.allSettled(components.map((component) => component.start()));

    for (const result of results) {
        if (result.status === 'rejected') {
            const reason = result.reason instanceof Error ?
                result.reason.message :
                String(result.reason);

            logger?.error(`A component failed to start and will not process any message: ${reason}`);
        }
    }
}
