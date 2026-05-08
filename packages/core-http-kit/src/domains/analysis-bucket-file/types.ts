/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';

export type AnalysisBucketFileCreatePayload =    & Pick<AnalysisBucketFile, 'analysis_bucket_id' | 'path' | 'bucket_id' | 'bucket_file_id'> &
    Partial<Pick<AnalysisBucketFile, 'root'>>;

export type AnalysisBucketFileUpdatePayload = Partial<Pick<AnalysisBucketFile, 'path' | 'root'>>;
