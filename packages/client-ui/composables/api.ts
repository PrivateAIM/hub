/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient as CoreAPIClient } from '@privateaim/core';
import type { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import type { APIClient as AuthupAPIClient } from '@authup/core';
import { useNuxtApp } from '#app';

export function useCoreAPI() : CoreAPIClient {
    return useNuxtApp().$coreAPI;
}

export function useStorageAPI() : StorageAPIClient {
    return useNuxtApp().$storageAPI;
}

export function useAuthupAPI(): AuthupAPIClient {
    return useNuxtApp().$authupAPI;
}
