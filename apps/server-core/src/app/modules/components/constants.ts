/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TaskManager } from '@privateaim/server-kit';
import { TypedToken } from 'eldin';
import type { TaskMap } from '../../../core/domains/index.ts';
import type { RegistryComponentCaller } from '../../components/registry/caller/module.ts';

export const ComponentsInjectionKey = {
    TaskManager: new TypedToken<TaskManager<TaskMap>>('TaskManager'),
    RegistryComponentCaller: new TypedToken<RegistryComponentCaller>('RegistryComponentCaller'),
} as const;
