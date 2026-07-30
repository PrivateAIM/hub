/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import type { IEntityAPISlim } from '../types-base';

export type AnalysisBucketCreatePayload = Pick<AnalysisBucket, 'analysisId' | 'bucketId' | 'type'>;

export interface IAnalysisBucketAPI extends IEntityAPISlim<AnalysisBucket, AnalysisBucketCreatePayload> {}
