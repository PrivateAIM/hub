/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StoreManagerOptions } from '@vuecs/list-controls/core';

export type Options = {
    coreURL: string,
    storageURL: string,
    realtimeURL: string,

    components?: boolean | string[],
    storeManager?: StoreManagerOptions,

    translatorLocale?: string,
};
