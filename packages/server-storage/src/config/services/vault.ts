/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { VaultClient } from '@hapic/vault';
import { setVaultFactory } from '../../core';
import { useEnv } from '../env';

export function configureVault() {
    const connectionString = useEnv('vaultConnectionString');
    if (!connectionString) {
        return;
    }

    setVaultFactory(() => new VaultClient({
        connectionString,
    }));
}
