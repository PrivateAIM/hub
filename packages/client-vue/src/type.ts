/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StoreManagerOptions } from '@vuecs/list-controls/core';
import type { APIClient as CoreAPIClient } from '@privateaim/core';
import type { APIClient as StorageAPIClient } from '@privateaim/storage-kit';

export type Options = {
    realtimeURL?: string,

    coreAPIClient?: CoreAPIClient,
    storageAPIClient?: StorageAPIClient,

    components?: boolean | string[],
    storeManager?: StoreManagerOptions
};
