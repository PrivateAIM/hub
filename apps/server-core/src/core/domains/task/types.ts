/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketType } from '@privateaim/core-kit';
import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { TaskType } from './constants.ts';

export type AnalysisBucketCreateTask = {
    analysisId: string,
    bucketType: `${AnalysisBucketType}`
};

export type AnalysisBucketDeleteTask = {
    analysisId: string,
};

export type TaskMap = ObjectLiteralKeys<{
    [TaskType.ANALYSIS_BUCKET_CREATE]: AnalysisBucketCreateTask,
    [TaskType.ANALYSIS_BUCKET_DELETE]: AnalysisBucketDeleteTask
}>;
