/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { IAnalysisReconciler } from '../../../core/services/analysis-reconciler/index.ts';

export type AnalysisReconcilerComponentContext = {
    reconciler: IAnalysisReconciler,
    logger?: Logger,
};
