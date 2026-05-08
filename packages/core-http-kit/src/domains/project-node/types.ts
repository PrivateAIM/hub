/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';

export type ProjectNodeCreatePayload = Pick<ProjectNode, 'project_id' | 'node_id'>;

export type ProjectNodeUpdatePayload = Partial<Pick<ProjectNode, 'approval_status' | 'comment'>>;
