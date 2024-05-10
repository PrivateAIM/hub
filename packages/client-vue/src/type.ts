/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StoreManagerOptions } from '@vuecs/list-controls/core';
import type { APIClient as CoreAPIClient } from '@privateaim/core';
import type { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import { Options as AuthupOptions } from '@authup/client-web-kit';
import type { SocketManager } from './core';

export type Options = {
    authup?: AuthupOptions,
    coreAPIClient?: CoreAPIClient,
    storageAPIClient?: StorageAPIClient,

    socketManager?: SocketManager,
    components?: boolean | string[],
    storeManager?: StoreManagerOptions
};
