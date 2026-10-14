/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionEvaluator } from '@authup/access';

export type RequestIdentity = {
    id: string;
    type: 'user' | 'client',
    realmId: string,
    realmName: string
    attributes?: Record<string, any>,
};

export type RequestEnv = {
    permissionEvaluator?: IPermissionEvaluator,

    identity?: RequestIdentity,

    scopes?: string[],
};
