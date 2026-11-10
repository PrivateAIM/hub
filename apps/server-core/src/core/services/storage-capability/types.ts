/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisStorageToken, AnalysisStorageTokenCreatePayload } from '@privateaim/core-kit';
import type { ActorContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisBucketRepository } from '../../entities/analysis-bucket/types.ts';
import type { IAnalysisBucketFileRepository } from '../../entities/analysis-bucket-file/types.ts';
import type { IAnalysisBucketAccess } from '../analysis-bucket-access/index.ts';

/** Port to the authority that signs capability tokens (Authup token exchange). */
export interface ICapabilityTokenIssuer {
    issue(input: {
        subjectToken: string,
        audience: string,
        cap: string[],
        expiresIn: number
    }): Promise<{ token: string, expiresIn: number }>;
}

export type StorageCapabilityServiceContext = {
    issuer: ICapabilityTokenIssuer;
    access: IAnalysisBucketAccess;
    analysisRepository: IAnalysisRepository;
    analysisBucketRepository: IAnalysisBucketRepository;
    analysisBucketFileRepository: IAnalysisBucketFileRepository;
};

export interface IStorageCapabilityService {
    /**
     * Mint a storage capability token for entries of one analysis. Every
     * entry must resolve inside the analysis and be allowed for the actor,
     * otherwise the whole request fails.
     */
    mint(
        analysisId: string,
        data: AnalysisStorageTokenCreatePayload,
        actor: ActorContext,
        subjectToken: string,
    ): Promise<AnalysisStorageToken>;
}
