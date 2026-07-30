/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type ProjectCreatePayload =    Partial<Pick<Project, 'name' | 'displayName' | 'description' | 'masterImageId'>>;

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

export interface IProjectAPI extends IEntityAPI<Project, ProjectCreatePayload, ProjectUpdatePayload> {}
