/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';

export type RegistryProjectCreatePayload = Pick<RegistryProject, 'registry_id' | 'name' | 'external_name' | 'type'>;

export type RegistryProjectUpdatePayload = Partial<Pick<RegistryProject, 'name' | 'external_name'>>;
