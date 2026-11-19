/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import type { APIRequestOptions } from './types';

/**
 * The per-request config of a call: only `signal` and `timeout` are taken
 * from the caller's options, and a key is set only when the caller set it,
 * so the result can be spread over a method's own defaults.
 */
export function buildRequestConfig(options?: APIRequestOptions) : RequestBaseOptions | undefined {
    if (!options) {
        return undefined;
    }

    const output : RequestBaseOptions = {};

    if (options.signal) {
        output.signal = options.signal;
    }

    if (typeof options.timeout !== 'undefined') {
        output.timeout = options.timeout;
    }

    return output;
}
