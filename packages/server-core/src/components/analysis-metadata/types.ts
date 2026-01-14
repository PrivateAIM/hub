/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { Analysis } from '@privateaim/core-kit';
import type { AnalysisMetadataCommand, AnalysisMetadataEvent } from './constants.ts';

export type AnalysisMetadataRecalcPayload = {
    analysisId: string,

    /**
     * default: true
     */
    queryNodes?: boolean,

    /**
     * default: true
     */
    querySelf?: boolean,

    /**
     * default: true
     */
    queryFiles?: boolean
};

export type AnalysisMetadataRecalcExecutedPayload = Analysis;

export type AnalysisMetadataEventMap = ObjectLiteralKeys<{
    [AnalysisMetadataCommand.RECALC]: [AnalysisMetadataRecalcPayload, ComponentMetadata],
    [AnalysisMetadataEvent.RECALC_FINISHED]: [AnalysisMetadataRecalcExecutedPayload, ComponentMetadata]
}>;
