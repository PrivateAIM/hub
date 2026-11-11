/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import type { ActorContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { IAnalysisReachService } from '../analysis-reach/types.ts';

export type AnalysisBucketAccessContext = {
    reach: IAnalysisReachService;
    analysisRepository: IAnalysisRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
};

export type AnalysisBucketUploader = {
    realmId?: string | null;
    clientId?: string;
};

/** Who may read, write and delete the files of an analysis bucket. */
export interface IAnalysisBucketAccess {
    /**
     * The file read rule for the bucket's type: CODE needs any participation,
     * TEMP an approved node, RESULT an approved node plus ANALYSIS_RESULT_READ.
     */
    canRead(actor: ActorContext, bucket: AnalysisBucket): Promise<boolean>;

    /**
     * The HTTP create rule: CODE needs the owner realm and an unlocked
     * analysis; RESULT/TEMP the system or a participant uploader. Throws.
     * `file` is the record the owner check evaluates attribute policies on.
     */
    assertWrite(
        actor: ActorContext,
        bucket: AnalysisBucket,
        analysis: Analysis,
        file?: Partial<AnalysisBucketFile>,
    ): Promise<void>;

    /** The delete rule: the owner realm plus {@link assertBucketWritable}. Throws. */
    assertDelete(
        actor: ActorContext,
        bucket: AnalysisBucket,
        analysis: Analysis,
        file?: Partial<AnalysisBucketFile>,
    ): Promise<void>;

    /**
     * Code files are frozen with the configuration; temp files belong to the
     * system alone. Throws.
     */
    assertBucketWritable(actor: ActorContext, bucket: AnalysisBucket, analysis: Analysis): Promise<void>;

    /**
     * Interim RESULT/TEMP participation rule: the analysis' own client, or the
     * realm of an approved analysis node.
     */
    isParticipantUploader(analysis: Analysis, uploader: AnalysisBucketUploader): Promise<boolean>;
}
