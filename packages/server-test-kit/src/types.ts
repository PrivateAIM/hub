/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionEvaluationContext } from '@authup/access';

export type PermissionMethod = 'preCheck' | 'check' | 'preCheckOneOf' | 'checkOneOf';

export type PermissionCall = {
    method: PermissionMethod;
    ctx: PermissionEvaluationContext;
};

/**
 * Decides one permission call. `method` lets a handler tell the all-of
 * methods (`preCheck`, `check`) apart from the one-of ones, so a fake can
 * hold a partial set of names and still answer like the real evaluator.
 */
export type PermissionHandler = (
    ctx: PermissionEvaluationContext,
    method: PermissionMethod,
) => void | Promise<void>;
