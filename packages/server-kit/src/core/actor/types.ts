/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionEvaluationContext } from '@authup/access';

export interface IPermissionChecker {
    preCheck(ctx: PermissionEvaluationContext): Promise<void>;
    check(ctx: PermissionEvaluationContext): Promise<void>;
    preCheckOneOf(ctx: PermissionEvaluationContext): Promise<void>;
    checkOneOf(ctx: PermissionEvaluationContext): Promise<void>;
}

export type ActorContext = {
    permissionChecker: IPermissionChecker;
    realm?: { id: string; name: string };
    identity?: {
        id: string;
        type: 'user' | 'robot' | 'client';
        realmId?: string;
        attributes?: Record<string, any>;
    };
    metadata?: Record<string, any>;
};
