/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisAPICommand } from '@personalhealthtrain/core';
import type { ActionCommandProperties } from '../../../core';

export type TrainCommandProperties = {
    entity: Analysis,
    command: `${AnalysisAPICommand}` | 'resultDownload',
} & ActionCommandProperties;
