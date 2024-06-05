/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { VaultClient, setVaultFactory } from '@privateaim/server-kit';
import { isBoolFalse, isBoolTrue } from '@privateaim/kit';
import { ConfigDefaults, useEnv } from '../env';

export function configureVault() {
    const connectionString = useEnv('vaultConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        setVaultFactory(() => new VaultClient({
            connectionString: isBoolTrue(connectionString) ?
                ConfigDefaults.VAULT :
                connectionString,
        }));
    }
}
