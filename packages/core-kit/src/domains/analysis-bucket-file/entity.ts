/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Client, 
    Realm, 
    User,
} from '@authup/core-kit';
import type { AnalysisBucket } from '../analysis-bucket';
import type { Analysis } from '../analysis';

export interface AnalysisBucketFile {
    id: string;

    path: string;

    root: boolean;

    // ------------------------------------------------------------------

    created_at: string;

    updated_at: string;

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

    client_id: Client['id'] | null;

    user_id: User['id'] | null;

    robot_id: Client['id'] | null;
}
