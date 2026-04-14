/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import type { MasterImageSynchronizerGroup, MasterImageSynchronizerImage } from '@privateaim/server-core-worker-kit';

export type MasterImageSynchronizerExecuteContext = {
    images: MasterImageSynchronizerImage[];
    groups: MasterImageSynchronizerGroup[];
};

export type MasterImageSynchronizerResult<T> = {
    updated: T[];
    created: T[];
    deleted: T[];
};

export type MasterImageSynchronizerExecuteResult = {
    images: MasterImageSynchronizerResult<MasterImage>;
    groups: MasterImageSynchronizerResult<MasterImageGroup>;
};
