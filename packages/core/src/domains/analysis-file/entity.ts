/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core';
import type { DomainType } from '../constants';
import type { Project } from '../project';
import type { Analysis } from '../analysis';
import type { DomainEventBaseContext } from '../types-base';

export interface AnalysisFile {
    id: string;

    name: string;

    hash: string;

    directory: string | null;

    size: number | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    user_id: User['id'];

    analysis_id: Analysis['id'];

    analysis: Analysis;

    realm_id: Realm['id'];
}

export type AnalysisFileEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_FILE}`,
    data: AnalysisFile
};
