/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type ProjectNodeCreatePayload = Pick<ProjectNode, 'projectId' | 'nodeId'>;

export type ProjectNodeUpdatePayload = Partial<Pick<ProjectNode, 'approvalStatus' | 'comment'>>;

export interface IProjectNodeAPI extends IEntityAPI<ProjectNode, ProjectNodeCreatePayload, ProjectNodeUpdatePayload> {}
