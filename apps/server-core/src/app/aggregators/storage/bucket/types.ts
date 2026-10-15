/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IAnalysisBucketFileRepository,
    IAnalysisBucketRepository,
    IAnalysisRepository,
} from '../../../../core/index.ts';
import type { BaseAggregatorHandlerContext } from '../../base.ts';

export type StorageBucketAggregatorContext = BaseAggregatorHandlerContext & {
    analysisRepository: IAnalysisRepository;
    analysisBucketRepository: IAnalysisBucketRepository;
    analysisBucketFileRepository: IAnalysisBucketFileRepository;
};
