/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type RegistryCreatePayload =    & Pick<Registry, 'name' | 'host'> &
    Partial<Pick<Registry, 'accountName' | 'accountSecret'>>;

export type RegistryUpdatePayload = Partial<RegistryCreatePayload>;

export interface IRegistryAPI extends IEntityAPI<Registry, RegistryCreatePayload, RegistryUpdatePayload> {}
