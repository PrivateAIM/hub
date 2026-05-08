/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';

export type ProjectCreatePayload =    & Pick<Project, 'name'> &
    Partial<Pick<Project, 'description' | 'master_image_id'>>;

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;
