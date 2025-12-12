/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot, User } from '@authup/core-kit';
import type { AnalysisBucket } from '../analysis-bucket';
import type { Analysis } from '../analysis';

export interface AnalysisBucketFile {
    id: string;

    path: string;

    root: boolean;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    bucket_id: string;

    bucket_file_id: string;

    // ------------------------------------------------------------------

    analysis_bucket_id: AnalysisBucket['id'];

    analysis_bucket: AnalysisBucket;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'] | null;

    robot_id: Robot['id'] | null;
}
