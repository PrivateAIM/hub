/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreator } from '@authup/core-http-kit';
import { createUserTokenCreator } from '@authup/core-http-kit';

/**
 * todo: fix usage
 */
export function createAuthupTokenCreator() : TokenCreator {
    return createUserTokenCreator({
        name: 'admin',
        password: 'start123',
    });
}
