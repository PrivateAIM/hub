/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Analysis } from '../analysis';
import type { AnalysisBucketType } from './constants';

export interface AnalysisBucket {
    id: string;

    type: `${AnalysisBucketType}`;

    // ------------------------------------------------------------------

    bucketId: string;

    // ------------------------------------------------------------------

    analysisId: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    realmId: Realm['id'];

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;
}
