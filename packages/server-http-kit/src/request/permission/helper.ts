/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionEvaluator } from '@authup/access';
import type { IAppEvent } from 'routup';
import { BadRequestError } from '@privateaim/errors';
import { useRequestEnv } from '../env';

/**
 * The request's evaluator is stored as-is. Whether it carries the policy
 * identity is decided once, when it is built (`resolveAuthupPolicySubject`),
 * so — unlike authup's own `RequestPermissionEvaluator`, which re-injects the
 * identity per call — there is nothing left for a per-request wrapper to add.
 */
export function useRequestPermissionEvaluator(event: IAppEvent) : IPermissionEvaluator {
    const evaluator = useRequestEnv(event, 'permissionEvaluator');
    if (!evaluator) {
        throw new BadRequestError('The request permission evaluator is not initialized.');
    }

    return evaluator;
}
