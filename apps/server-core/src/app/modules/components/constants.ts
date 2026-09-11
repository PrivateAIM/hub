/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TaskManager } from '@privateaim/server-kit';
import { TypedToken } from 'eldin';
import type { TaskMap } from '../../../core/domains/index.ts';
import type { IRegistryCaller } from '../../../core/harbor/types.ts';

export const ComponentsInjectionKey = {
    TaskManager: new TypedToken<TaskManager<TaskMap>>('TaskManager'),
    // Typed against the port `RegistryComponentCaller` implements, not the
    // concrete class — every consumer only ever calls `.call(...)` on this
    // (see `RegistryService.registryCaller`, already typed `IRegistryCaller`),
    // and the narrower port is what makes this fake-able in tests.
    RegistryComponentCaller: new TypedToken<IRegistryCaller>('RegistryComponentCaller'),
} as const;
