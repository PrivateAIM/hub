/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type AnalysisBucketFileCreatePayload =    & Pick<AnalysisBucketFile, 'analysisBucketId' | 'path' | 'bucketId' | 'bucketFileId'> &
    Partial<Pick<AnalysisBucketFile, 'root'>>;

export type AnalysisBucketFileUpdatePayload = Partial<Pick<AnalysisBucketFile, 'path' | 'root'>>;

export interface IAnalysisBucketFileAPI extends IEntityAPI<
    AnalysisBucketFile,
    AnalysisBucketFileCreatePayload,
    AnalysisBucketFileUpdatePayload
> {}
