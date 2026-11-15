/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IApplication } from 'orkos';
import type { StartApplicationOptions } from './types';

const SHUTDOWN_TIMEOUT = 30_000;

/**
 * Own a production process's startup and one-shot SIGINT/SIGTERM shutdown.
 *
 * The first signal calls `onSignal` (readiness answers 503 from then on) and,
 * when setup had completed, waits the drain delay it answers while the
 * listeners keep serving; a second signal ends that wait early. Then setup
 * (if still running) and teardown are bounded to 30 s, which start after the
 * delay: a stop timeout must exceed the delay plus 30 s.
 */
export async function startApplication(
    app: Pick<IApplication, 'setup' | 'teardown'>,
    options: StartApplicationOptions = {},
): Promise<void> {
    let stopping: Promise<void> | undefined;
    let setup: Promise<void>;
    let started = false;
    let endDelay: (() => void) | undefined;

    const shutdown = () => {
        if (stopping) {
            endDelay?.();

            return stopping;
        }

        let delay = 0;

        try {
            delay = options.onSignal?.() ?? 0;
        } catch (error) {
            process.stderr.write(`Application stop signal hook failed: ${String(error)}\n`);
        }

        stopping = (async () => {
            let exitCode = process.exitCode || 0;

            // A process that never finished setup served nothing to drain.
            if (started && delay > 0) {
                await new Promise<void>((resolve) => {
                    const timer = setTimeout(resolve, delay);

                    endDelay = () => {
                        clearTimeout(timer);
                        resolve();
                    };
                });

                endDelay = undefined;
            }

            // Bound startup, teardown and any handles left open after teardown.
            const deadline = setTimeout(() => {
                process.stderr.write('Application shutdown timed out\n');
                process.exit(1);
            }, SHUTDOWN_TIMEOUT);

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
        started = true;
    } catch (error) {
        await shutdown();

        throw error;
    }
}
