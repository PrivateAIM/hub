/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Query, and, eq } from '@rapiq/core';
import type { ICondition } from '@rapiq/core';
import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import { evaluateRecord, hasUnboundedReach, isPermissionError } from '@authup/access';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { AnalysisReachTarget, IAnalysisReachService } from '../analysis-reach/types.ts';
import type {
    AnalysisBucketAccessContext,
    AnalysisBucketUploader,
    IAnalysisBucketAccess,
} from './types.ts';

/** The reach is resolved against the analysis itself. */
const ANALYSIS_TARGET: AnalysisReachTarget = {
    analysisPath: '',
    analysisIdAttributeName: 'id',
};

export class AnalysisBucketAccess extends AbstractEntityService implements IAnalysisBucketAccess {
    protected reach: IAnalysisReachService;

    protected analysisRepository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    constructor(ctx: AnalysisBucketAccessContext) {
        super();
        this.reach = ctx.reach;
        this.analysisRepository = ctx.analysisRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
    }

    /**
     * D2/D6: CODE for every participant, TEMP only through an approved node,
     * RESULT additionally only with ANALYSIS_RESULT_READ, narrowed by that
     * grant's own reach (the same conditions the file listing applies).
     */
    async canRead(actor: ActorContext, bucket: AnalysisBucket): Promise<boolean> {
        let condition: ICondition | undefined;

        try {
            condition = await this.resolveReadReach(actor, bucket.type);
        } catch (e) {
            if (isPermissionError(e)) {
                return false;
            }

            throw e;
        }

        const { data } = await this.analysisRepository.findMany(
            appendQueryConditions(new Query({}), eq('id', bucket.analysisId), ...(condition ? [condition] : [])),
        );

        return data.length > 0;
    }

    async assertWrite(
        actor: ActorContext,
        bucket: AnalysisBucket,
        analysis: Analysis,
        file: Partial<AnalysisBucketFile> = {},
    ): Promise<void> {
        if (bucket.type === AnalysisBucketType.CODE) {
            await this.assertOwner(actor, analysis, file);
            this.assertUnlocked(analysis);

            return;
        }

        if (
            !await this.isSystem(actor) &&
            !await this.isParticipantUploader(analysis, {
                realmId: this.getActorRealmId(actor),
                clientId: actor.identity?.type === 'client' ? actor.identity.id : undefined,
            })
        ) {
            throw new PermissionDeniedError();
        }
    }

    async assertDelete(
        actor: ActorContext,
        bucket: AnalysisBucket,
        analysis: Analysis,
        file: Partial<AnalysisBucketFile> = {},
    ): Promise<void> {
        await this.assertOwner(actor, analysis, file);
        await this.assertBucketWritable(actor, bucket, analysis);
    }

    async assertBucketWritable(actor: ActorContext, bucket: AnalysisBucket, analysis: Analysis): Promise<void> {
        if (bucket.type === AnalysisBucketType.CODE) {
            this.assertUnlocked(analysis);
        }

        if (bucket.type === AnalysisBucketType.TEMP && !await this.isSystem(actor)) {
            throw new PermissionDeniedError();
        }
    }

    /**
     * Interim RESULT/TEMP participation rule until plan 021: the analysis' own
     * client (it sits in the owner realm, so it participates by binding — D8),
     * or the realm of an approved analysis node.
     */
    async isParticipantUploader(analysis: Analysis, uploader: AnalysisBucketUploader): Promise<boolean> {
        if (uploader.clientId && analysis.clientId === uploader.clientId) {
            return true;
        }

        // typeorm drops an undefined key, which would match any approved node.
        if (!uploader.realmId) {
            return false;
        }

        const participant = await this.analysisNodeRepository.findOneBy({
            analysisId: analysis.id,
            nodeRealmId: uploader.realmId,
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
        });

        return !!participant;
    }

    protected async resolveReadReach(actor: ActorContext, type: `${AnalysisBucketType}`): Promise<ICondition | undefined> {
        switch (type) {
            case AnalysisBucketType.CODE:
                return this.reach.resolve(actor, ANALYSIS_TARGET);
            case AnalysisBucketType.TEMP:
                return this.reach.resolve(actor, ANALYSIS_TARGET, { approvedOnly: true });
            case AnalysisBucketType.RESULT: {
                const temp = await this.reach.resolve(actor, ANALYSIS_TARGET, { approvedOnly: true });
                const result = await this.reach.resolve(actor, ANALYSIS_TARGET, {
                    names: [PermissionName.ANALYSIS_RESULT_READ],
                    approvedOnly: true,
                });

                // The result read narrows the approved-participant reach, never widens it.
                if (temp === undefined) {
                    return result;
                }

                return result === undefined ? temp : and(temp, result);
            }
            default:
                throw new PermissionDeniedError();
        }
    }

    /** The system: a grant reaching every realm unconditionally (plan 021, Q4). */
    protected async isSystem(actor: ActorContext): Promise<boolean> {
        return hasUnboundedReach(actor.permissionEvaluator, PermissionName.ANALYSIS_UPDATE);
    }

    /** The analysis' realm writes the file, whichever realm uploaded it (D3). */
    protected async assertOwner(actor: ActorContext, analysis: Analysis, file: Partial<AnalysisBucketFile>): Promise<void> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.ANALYSIS_UPDATE,
            realm: analysis.realmId,
            data: { attributes: file },
        });
    }

    protected assertUnlocked(analysis: Analysis): void {
        if (analysis.configurationLocked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }
    }
}
