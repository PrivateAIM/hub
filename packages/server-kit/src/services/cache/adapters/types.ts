/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CacheClearOptions, CacheSetOptions } from '../types';

export interface CacheAdapter {
    set(key: string, value: any, options: CacheSetOptions): Promise<void>;

    get(key: string): Promise<any | undefined>;

    has(key: string) : Promise<boolean>;

    drop(key: string): Promise<void>;

    dropMany(keys: string[]) : Promise<void>;

    clear(options: CacheClearOptions) : Promise<void>;
}