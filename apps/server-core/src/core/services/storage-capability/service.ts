/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
    AnalysisBucket,
    AnalysisBucketFile,
    AnalysisStorageToken,
    AnalysisStorageTokenCreatePayload,
} from '@privateaim/core-kit';
import { AnalysisStorageTokenValidator } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { CapabilityEntry } from '@privateaim/kit';
import { ValidatorGroup, parseCapabilityEntries } from '@privateaim/kit';
import type { ActorContext } from '@privateaim/server-kit';
import {
    STORAGE_CAPABILITY_AUDIENCE,
    STORAGE_CAPABILITY_TOKEN_MAX_LIFETIME,
    StorageCapabilityAction,
    StorageCapabilityType,
    assertStorageCapabilityEntry,
} from '@privateaim/storage-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisBucketRepository } from '../../entities/analysis-bucket/types.ts';
import type { IAnalysisBucketFileRepository } from '../../entities/analysis-bucket-file/types.ts';
import type { IAnalysisBucketAccess } from '../analysis-bucket-access/index.ts';
import type {
    ICapabilityTokenIssuer,
    IStorageCapabilityService,
    StorageCapabilityServiceContext,
} from './types.ts';

type ResolvedEntry = {
    bucket: AnalysisBucket,
    // The stored row of a bucket-file entry; a prospective row for a bucket entry.
    file: Partial<AnalysisBucketFile>
};

export class StorageCapabilityService implements IStorageCapabilityService {
    protected issuer: ICapabilityTokenIssuer;

    protected analysisBucketAccess: IAnalysisBucketAccess;

    protected analysisRepository: IAnalysisRepository;

    protected analysisBucketRepository: IAnalysisBucketRepository;

    protected analysisBucketFileRepository: IAnalysisBucketFileRepository;

    protected validator: AnalysisStorageTokenValidator;

    constructor(ctx: StorageCapabilityServiceContext) {
        this.issuer = ctx.issuer;
        this.analysisBucketAccess = ctx.analysisBucketAccess;
        this.analysisRepository = ctx.analysisRepository;
        this.analysisBucketRepository = ctx.analysisBucketRepository;
        this.analysisBucketFileRepository = ctx.analysisBucketFileRepository;
        this.validator = new AnalysisStorageTokenValidator();
    }

    async mint(
        analysisId: string,
        data: AnalysisStorageTokenCreatePayload,
        actor: ActorContext,
        subjectToken: string,
    ): Promise<AnalysisStorageToken> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        const analysis = await this.analysisRepository.findOneBy({ id: analysisId });

        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        const entries = this.parseEntries(validated.cap);

        for (const entry of entries) {
            const resolved = await this.resolve(analysis, entry);

            for (const action of entry.actions) {
                await this.authorize(actor, analysis, resolved, action);
            }
        }

        const issued = await this.issuer.issue({
            subjectToken,
            audience: STORAGE_CAPABILITY_AUDIENCE,
            cap: validated.cap,
            expiresIn: validated.lifetime ?? STORAGE_CAPABILITY_TOKEN_MAX_LIFETIME,
        });

        return {
            token: issued.token,
            expiresAt: new Date(Date.now() + issued.expiresIn * 1000).toISOString(),
        };
    }

    protected parseEntries(values: string[]): CapabilityEntry[] {
        try {
            const entries = parseCapabilityEntries(values);

            for (const entry of entries) {
                assertStorageCapabilityEntry(entry);
            }

            return entries;
        } catch (e) {
            if (e instanceof TypeError) {
                throw new BadRequestError(e.message);
            }

            throw e;
        }
    }

    protected async resolve(analysis: Analysis, entry: CapabilityEntry): Promise<ResolvedEntry> {
        if (entry.type === StorageCapabilityType.BUCKET) {
            const bucket = await this.analysisBucketRepository.findOneBy({
                analysisId: analysis.id,
                bucketId: entry.id,
            });

            if (!bucket) {
                throw new BadRequestError(`Capability entry "${entry.type}:${entry.id}" does not belong to the analysis.`);
            }

            return {
                bucket,
                file: {
                    analysisId: analysis.id,
                    analysisBucketId: bucket.id,
                    bucketId: bucket.bucketId,
                    realmId: bucket.realmId,
                },
            };
        }

        const file = await this.analysisBucketFileRepository.findOneBy({
            analysisId: analysis.id,
            bucketFileId: entry.id,
        });
        const bucket = file ?
            await this.analysisBucketRepository.findOneBy({ id: file.analysisBucketId, analysisId: analysis.id }) :
            null;

        if (!file || !bucket) {
            throw new BadRequestError(`Capability entry "${entry.type}:${entry.id}" does not belong to the analysis.`);
        }

        return { bucket, file };
    }

    protected async authorize(
        actor: ActorContext,
        analysis: Analysis,
        { bucket, file }: ResolvedEntry,
        action: string,
    ): Promise<void> {
        switch (action) {
            case StorageCapabilityAction.READ:
                if (!await this.analysisBucketAccess.canRead(actor, bucket)) {
                    throw new PermissionDeniedError();
                }

                return;
            case StorageCapabilityAction.WRITE:
                await this.analysisBucketAccess.assertWrite(actor, bucket, analysis, file);

                return;
            case StorageCapabilityAction.DELETE:
                await this.analysisBucketAccess.assertDelete(actor, bucket, analysis, file);

                return;
            default:
                throw new BadRequestError(`Unsupported capability action "${action}".`);
        }
    }
}
