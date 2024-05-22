/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core-http-kit';
import { isVaultClientUsable, useVaultClient } from '../vault';

export function guessAuthupTokenCreatorOptions() : TokenCreatorOptions {
    let options : TokenCreatorOptions;
    if (isVaultClientUsable()) {
        options = {
            type: 'robotInVault',
            name: 'system',
            vault: useVaultClient(),
        };
    } else {
        options = {
            type: 'user',
            name: 'admin',
            password: 'start123',
        };
    }

    return options;
}
