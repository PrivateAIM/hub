/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
} from '@personalhealthtrain/core';

import type {
    ComponentName,
} from '@personalhealthtrain/server-train-manager';

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
