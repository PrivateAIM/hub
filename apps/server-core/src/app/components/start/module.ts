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
 * Resolves once every start settled; it never rejects. Each failure is logged
 * when it rejects, not when the slowest start settles.
 */
export async function startComponentsInBackground(
    components: IComponent[],
    logger?: Logger,
): Promise<void> {
    // each failure is logged as it happens: a start that never settles must
    // not hold back the error of one that already failed.
    await Promise.allSettled(components.map((component) => component.start().catch((e: unknown) => {
        const reason = Error.isError(e) ? e.message : String(e);

        logger?.error(`A component failed to start and will not process any message: ${reason}`);
    })));
}
