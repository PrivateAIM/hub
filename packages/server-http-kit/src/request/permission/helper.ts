/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IRoutupEvent } from 'routup';
import { BadRequestError } from '@ebec/http';
import { setRequestEnv, useRequestEnv } from '../env';
import type { RequestPermissionChecker } from './module';

export function setRequestPermissionChecker(event: IRoutupEvent, checker: RequestPermissionChecker) {
    setRequestEnv(event, 'permissionChecker', checker);
}

export function useRequestPermissionChecker(event: IRoutupEvent) : RequestPermissionChecker {
    const checker = useRequestEnv(event, 'permissionChecker');
    if (!checker) {
        throw new BadRequestError('The request permission checker is not initialized.');
    }

    return checker;
}
