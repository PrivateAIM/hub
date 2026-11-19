/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Per-call request options, the trailing argument of every api method:
 * `signal` aborts the call, `timeout` (milliseconds) overrides the
 * client's own for this call. Absent, the client defaults apply.
 */
export type APIRequestOptions = {
    signal?: AbortSignal,
    timeout?: number,
};
