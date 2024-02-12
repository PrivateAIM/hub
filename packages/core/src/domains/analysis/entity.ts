/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core';
import type { DomainType } from '../constants';
import type { MasterImage } from '../master-image';
import type { Project } from '../project';
import type { AnalysisFile } from '../analysis-file';
import type { DomainEventBaseContext } from '../types-base';
import type {
    AnalysisBuildStatus,
    AnalysisConfigurationStatus,
    AnalysisResultStatus,
    AnalysisRunStatus,
} from './constants';
import type { Registry } from '../registry';

export interface Analysis {
    id: string;

    name: string | null;

    entrypoint_file_id: AnalysisFile['id'];

    entrypoint_file: AnalysisFile;

    nodes: number;

    // ------------------------------------------------------------------

    configuration_status: AnalysisConfigurationStatus | null;

    // ------------------------------------------------------------------

    build_status: AnalysisBuildStatus | null;

    // ------------------------------------------------------------------

    run_status: AnalysisRunStatus | null;

    // ------------------------------------------------------------------

    result_status: AnalysisResultStatus | null;

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
