/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAppEvent } from 'routup';
import type { RequestCapability } from './types';
import { useRequestEnv } from './env';

export function useRequestCapability(event: IAppEvent) : RequestCapability | undefined {
    return useRequestEnv(event, 'capability');
}

/**
 * The raw access token of an identity request; `undefined` for an anonymous
 * or a capability request.
 */
export function useRequestToken(event: IAppEvent) : string | undefined {
    return useRequestEnv(event, 'token');
}
