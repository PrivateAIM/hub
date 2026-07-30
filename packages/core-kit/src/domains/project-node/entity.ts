/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Project } from '../project';
import type { Node } from '../node';
import type { ProjectNodeApprovalStatus } from './constants';

export interface ProjectNode {
    id: string;

    approvalStatus: ProjectNodeApprovalStatus | null;

    comment: string | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    projectId: Project['id'];

    project: Project;

    projectRealmId: Realm['id'];

    nodeId: Node['id'];

    node: Node;

    nodeRealmId: Realm['id'];
}
