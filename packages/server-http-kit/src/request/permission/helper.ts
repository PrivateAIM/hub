/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { BadRequestError } from '@ebec/http';
import { setRequestEnv, useRequestEnv } from '../env';
import type { RequestPermissionChecker } from './module';

export function setRequestPermissionChecker(req: Request, checker: RequestPermissionChecker) {
    setRequestEnv(req, 'permissionChecker', checker);
}

export function useRequestPermissionChecker(req: Request) : RequestPermissionChecker {
    const checker = useRequestEnv(req, 'permissionChecker');
    if (!checker) {
        throw new BadRequestError('The request permission checker is not initialized.');
    }

    return checker;
}
