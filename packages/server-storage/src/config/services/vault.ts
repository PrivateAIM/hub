/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { VaultClient, setVaultFactory } from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureVault() {
    const connectionString = useEnv('vaultConnectionString');
    if (!connectionString) {
        return;
    }

    setVaultFactory(() => new VaultClient({
        connectionString,
    }));
}
