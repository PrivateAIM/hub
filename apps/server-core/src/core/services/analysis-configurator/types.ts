/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityPersistContext } from '../../entities/types.ts';

export type AnalysisConfiguratorUnlockOptions = {
    ignoreApproval?: boolean;
    persistCtx?: EntityPersistContext;
};

export type AnalysisConfiguratorLockOptions = {
    ignoreApproval?: boolean;
    persistCtx?: EntityPersistContext;
};
