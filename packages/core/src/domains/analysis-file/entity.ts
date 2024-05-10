/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot, User } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { Analysis } from '../analysis';
import type { DomainEventBaseContext } from '../types-base';
import type { AnalysisFileType } from './constants';

export interface AnalysisFile {
    id: string;

    name: string;

    type: `${AnalysisFileType}`;

    root: boolean;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    bucket_file_id: string;

    target_realm_id: string;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'] | null;

    robot_id: Robot['id'] | null;

    // todo: add target_realm_id xand target_node_id
}

export type AnalysisFileEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_FILE}`,
    data: AnalysisFile
};
