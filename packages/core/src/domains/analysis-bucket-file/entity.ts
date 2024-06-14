/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot, User } from '@authup/core-kit';
import type { AnalysisBucket } from '../analysis-bucket';
import type { DomainType } from '../constants';
import type { Analysis } from '../analysis';
import type { DomainEventBaseContext } from '../types-base';

export interface AnalysisBucketFile {
    id: string;

    name: string;

    root: boolean;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    external_id: string;

    // ------------------------------------------------------------------

    bucket_id: AnalysisBucket['id'];

    bucket: AnalysisBucket;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'] | null;

    robot_id: Robot['id'] | null;
}

export type AnalysisFileEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_BUCKET_FILE}`,
    data: AnalysisBucketFile
};
