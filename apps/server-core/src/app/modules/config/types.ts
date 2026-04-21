/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseServerConfig } from '@privateaim/server-kit';

export interface Config extends BaseServerConfig {
    vaultConnectionString?: string;
    harborURL?: string;

    telemetryURL?: string;

    masterImagesRepository: string;
    masterImagesOwner: string;
    masterImagesBranch: string;

    skipProjectApproval: boolean;
    skipAnalysisApproval: boolean;
}
