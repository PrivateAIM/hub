/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient as CoreAPIClient } from '@privateaim/core';
import { useNuxtApp } from '#app';

export function useCoreAPI() : CoreAPIClient {
    return useNuxtApp().$coreAPI;
}
