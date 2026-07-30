/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from './bucket';
import type { BucketFile } from './bucket-file';
import type { DomainType } from './constants';

type DomainTypeMapRaw = {
    [DomainType.BUCKET]: Bucket,
    [DomainType.BUCKET_FILE]: BucketFile,
};

export type DomainTypeMap = {
    [K in keyof DomainTypeMapRaw as `${K}`]: DomainTypeMapRaw[K]
};
