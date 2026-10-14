/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionEvaluator } from '@authup/access';

export type ActorContext = {
    permissionEvaluator: IPermissionEvaluator;
    realm?: { id: string; name: string };
    identity?: {
        id: string;
        type: 'user' | 'robot' | 'client';
        realmId?: string;
        attributes?: Record<string, any>;
    };
    metadata?: Record<string, any>;
};
