/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type Heartbeat = {
    /**
     * Record real progress: resets the silence bound.
     */
    touch: () => void,
    stop: () => void,
};

export type ComponentErrorOptions = {
    code?: string | null,
    message?: string,
    cause?: unknown,
};
