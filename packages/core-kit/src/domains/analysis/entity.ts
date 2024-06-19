/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { MasterImage } from '../master-image';
import type { Project } from '../project';
import type { DomainEventBaseContext } from '../types-base';
import type {
    AnalysisBuildStatus,
    AnalysisRunStatus,
} from './constants';
import type { Registry } from '../registry';

export interface Analysis {
    id: string;

    name: string | null;

    nodes: number;

    // ------------------------------------------------------------------

    configuration_locked: boolean;

    // ------------------------------------------------------------------

    build_status: AnalysisBuildStatus | null;

    // ------------------------------------------------------------------

    run_status: AnalysisRunStatus | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    registry: Registry;

    registry_id: Registry['id'];

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'];

    // ------------------------------------------------------------------

    project_id: Project['id'];

    project: Project;

    // ------------------------------------------------------------------

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage;
}

export type AnalysisEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS}`,
    data: Analysis
};
