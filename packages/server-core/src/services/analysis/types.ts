/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';

export type AnalysisManagerUnlockOptions = {
    ignoreApproval?: boolean,
    request?: Request
};

export type AnalysisManagerLockOptions = {
    ignoreApproval?: boolean,
    request?: Request
};
