/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { AnalysisMetadataCommand } from './constants';

export type AnalysisMetadataRecalcPayload = {
    analysisId: string
};

export type AnalysisMetadataTaskMap = ObjectLiteralKeys<{
    [AnalysisMetadataCommand.RECALC]: [AnalysisMetadataRecalcPayload, ComponentMetadata]
}>;
