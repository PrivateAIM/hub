/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFileTaskCaller } from '@privateaim/server-storage-kit';
import type { Logger } from '@privateaim/server-kit';
import type { IAnalysisBucketFileService } from '../../../../core/index.ts';

export type StorageBucketFileAggregatorContext = {
    service: IAnalysisBucketFileService;
    bucketFileCaller?: BucketFileTaskCaller;
    logger?: Logger;
};
