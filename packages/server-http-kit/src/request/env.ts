/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAppEvent } from 'routup';
import type { RequestEnv } from './types';

export function useRequestEnv(event: IAppEvent) : RequestEnv;
export function useRequestEnv<T extends keyof RequestEnv>(event: IAppEvent, key: T) : RequestEnv[T];
export function useRequestEnv<T extends keyof RequestEnv>(event: IAppEvent, key?: T) {
    if (typeof key === 'string') {
        return event.store[key] as RequestEnv[T];
    }

    return event.store as unknown as RequestEnv;
}

export function setRequestEnv<T extends keyof RequestEnv>(
    event: IAppEvent,
    key: T,
    value: RequestEnv[T],
) {
    event.store[key] = value;
}
