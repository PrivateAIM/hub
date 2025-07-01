/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentName,
} from '@privateaim/server-analysis-manager-kit';

export type AnalysisLogSaveContext = {
    analysisId: string,
    realmId: string,

    error?: boolean,
    errorCode?: string,

    component?: `${ComponentName}`,
    command?: string,
    event?: string,

    status?: string,
    statusMessage?: string
};
