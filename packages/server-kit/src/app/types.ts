/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type StartApplicationOptions = {
    /**
     * Runs once, on the first stop signal. Answers the milliseconds to keep
     * serving before teardown (the drain delay), e.g.
     * `createHealthShutdownHook(app.container)`.
     */
    onSignal?: () => number | undefined,
};
