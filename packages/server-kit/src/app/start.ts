/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IApplication } from 'orkos';

/** Own a production process's startup and one-shot SIGINT/SIGTERM shutdown. */
export async function startApplication(app: Pick<IApplication, 'setup' | 'teardown'>): Promise<void> {
    let stopping: Promise<void> | undefined;
    let setup: Promise<void>;

    const shutdown = () => {
        if (stopping) {
            return stopping;
        }

        // Bound startup, teardown and any handles left open after teardown.
        const deadline = setTimeout(() => {
            process.stderr.write('Application shutdown timed out\n');
            process.exit(1);
        }, 30_000);

        stopping = (async () => {
            let exitCode = process.exitCode || 0;

            try {
                await setup;
            } catch (error) {
                process.stderr.write(`Application setup failed: ${String(error)}\n`);
                exitCode = 1;
            }

            try {
                await app.teardown();
            } catch (error) {
                process.stderr.write(`Application shutdown failed: ${String(error)}\n`);
                exitCode = 1;
            }

            // Let buffered output drain naturally; remaining handles still hit the deadline.
            process.exitCode = exitCode;
            deadline.unref();
        })();

        return stopping;
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    setup = (async () => app.setup())();

    try {
        await setup;
    } catch (error) {
        await shutdown();

        throw error;
    }
}
