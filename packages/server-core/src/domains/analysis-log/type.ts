/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
} from '@privateaim/core';

import type {
    ComponentName,
} from '@privateaim/server-analysis-manager';

export type AnalysisLogSaveContext = {
    train: Pick<Analysis, 'id'> &
    Partial<Pick<Analysis, 'realm_id'>>,

    error?: boolean,
    errorCode?: string,

    component?: `${ComponentName}`,
    command?: string,
    event?: string,
    step?: string,

    status?: string,
    statusMessage?: string
};
