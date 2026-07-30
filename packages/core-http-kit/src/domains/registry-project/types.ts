/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type RegistryProjectCreatePayload = Pick<RegistryProject, 'registryId' | 'name' | 'externalName' | 'type'>;

export type RegistryProjectUpdatePayload = Partial<Pick<RegistryProject, 'name' | 'externalName'>>;

export interface IRegistryProjectAPI extends IEntityAPI<
    RegistryProject,
    RegistryProjectCreatePayload,
    RegistryProjectUpdatePayload
> {}
