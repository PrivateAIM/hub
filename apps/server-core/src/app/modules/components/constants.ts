/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IRegistryDispatcher } from '../../../core/harbor/types.ts';

export const ComponentsInjectionKey = {
    // Typed against the port `RegistryComponentDispatcher` implements, not the
    // concrete class — every consumer only ever calls `.dispatch(...)` on this
    // (see `RegistryService.registryDispatcher`, already typed `IRegistryDispatcher`),
    // and the narrower port is what makes this fake-able in tests.
    RegistryComponentDispatcher: new TypedToken<IRegistryDispatcher>('RegistryComponentDispatcher'),
} as const;
