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

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    bucketId: string;

    bucketFileId: string;

    // ------------------------------------------------------------------

    analysisBucketId: AnalysisBucket['id'];

    analysisBucket: AnalysisBucket;

    // ------------------------------------------------------------------

    analysisId: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    realmId: Realm['id'];

    clientId: Client['id'] | null;

    userId: User['id'] | null;

    robotId: Client['id'] | null;
}
