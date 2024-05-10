/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { Project } from '../project';
import type { Node } from '../node';
import type { DomainEventBaseContext } from '../types-base';
import type { ProjectNodeApprovalStatus } from './constants';

export interface ProjectNode {
    id: string;

    approval_status: ProjectNodeApprovalStatus | null;

    comment: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    project_id: Project['id'];

    project: Project;

    project_realm_id: Realm['id'];

    node_id: Node['id'];

    node: Node;

    node_realm_id: Realm['id'];
}

export type ProjectNodeEventContext = DomainEventBaseContext & {
    type: `${DomainType.PROJECT_NODE}`,
    data: ProjectNode
};
