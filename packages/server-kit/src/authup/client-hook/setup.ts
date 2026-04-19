/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientAuthenticationHookOptions } from '@authup/core-http-kit';
import { ClientAuthenticationHook } from '@authup/core-http-kit';

export function createAuthupClientAuthenticationHook(options: ClientAuthenticationHookOptions) {
    return new ClientAuthenticationHook(options);
}
