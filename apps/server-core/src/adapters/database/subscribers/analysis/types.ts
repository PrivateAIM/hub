/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';

export interface IAnalysisMetadataCaller {
    call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
}

export interface IAnalysisStorageManager {
    check(input: string | Analysis): Promise<Analysis>;
    remove(input: string | Analysis): Promise<Analysis>;
}
