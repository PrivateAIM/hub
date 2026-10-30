/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler, ComponentHandlerContext } from 'hubwire';
import type { BucketComponentEventMap, BucketCreateCommandPayload } from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { BucketValidator, DomainType, assertBucketRefPairing } from '@privateaim/storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { Repository } from 'typeorm';
import { IsNull, QueryFailedError } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import type { IStorageAdapter } from '../../../../../core/storage/types.ts';
import { BucketEntity } from '../../../../../adapters/database/index.ts';
import { toBucketName } from '../../../../../core/utils/bucket-name.ts';
import { ValidatorGroup } from '@privateaim/kit';

export class BucketCreateHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketCommand.CREATE
> {
    protected validator : BucketValidator;

    protected storage: IStorageAdapter;

    protected logger: Logger | undefined;

    constructor(ctx: { storage: IStorageAdapter; logger?: Logger }) {
        this.validator = new BucketValidator();
        this.storage = ctx.storage;
        this.logger = ctx.logger;
    }

    async handle(
        value: BucketCreateCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.process(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: BucketCommand.CREATE,
                analysisId: value.id,
                [LogFlag.REF_ID]: value.id,
                [LogFlag.REF_TYPE]: DomainType.BUCKET,
            });

            await context.handle(
                BucketEvent.CREATION_FAILED,
                {
                    id: value.id,
                    error: e,
                    refType: value.refType,
                    refId: value.refId,
                    name: value.name,
                },
            );
        }
    }

    protected async process(
        value: BucketCreateCommandPayload,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
        await context.handle(
            BucketEvent.CREATION_STARTED,
            value,
        );

        const data = await this.validator.run(value, { group: ValidatorGroup.CREATE });

        assertBucketRefPairing(data);

        // The validator mounts no actor (a client must not name one): take it from the
        // command, whose senders are trusted — BucketService (HTTP) sets it from the ActorContext.
        data.actorId = value.actorId ?? null;
        data.actorType = value.actorType ?? null;

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(BucketEntity);

        // idempotent per (refType, refId, name): a repeated create replies with the existing bucket.
        const existing = await this.findExisting(repository, data);

        if (existing) {
            await this.finish(existing, context);

            return;
        }

        const entity = repository.create(data);

        try {
            await repository.save(entity);
        } catch (e) {
            // a concurrent create won the unique (refType, refId, name).
            const winner = isUniqueViolation(e) ? await this.findExisting(repository, data) : null;

            if (!winner) {
                throw e;
            }

            await this.finish(winner, context);

            return;
        }

        try {
            await this.makeStorageBucket(entity);
        } catch (e) {
            await repository.remove(entity);

            throw e;
        }

        await context.handle(
            BucketEvent.CREATION_FINISHED,
            { ...entity },
        );
    }

    protected async findExisting(repository: Repository<BucketEntity>, data: Partial<BucketEntity>): Promise<BucketEntity | null> {
        // NULL refs are unconstrained: a ref-less create always makes a new bucket.
        if (!data.refType || !data.refId) {
            return null;
        }

        // ponytail: a same-ref bucket of another realm is not reused; the save then fails the unique.
        return repository.findOneBy({
            refType: data.refType,
            refId: data.refId,
            name: data.name,
            realmId: data.realmId ?? IsNull(),
        });
    }

    /**
     * Idempotent: a concurrent create of the same bucket may have made it already.
     */
    protected async makeStorageBucket(entity: BucketEntity): Promise<void> {
        try {
            if (entity.region) {
                await this.storage.makeBucket(toBucketName(entity.id), entity.region);
            } else {
                await this.storage.makeBucket(toBucketName(entity.id));
            }
        } catch (e) {
            if (!await this.storage.bucketExists(toBucketName(entity.id))) {
                throw e;
            }
        }
    }

    protected async finish(
        entity: BucketEntity,
        context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CREATE>,
    ): Promise<void> {
        // the row may outlive a crash between save and makeBucket.
        await this.makeStorageBucket(entity);

        await context.handle(
            BucketEvent.CREATION_FINISHED,
            { ...entity },
        );
    }
}

function isUniqueViolation(e: unknown): boolean {
    if (!(e instanceof QueryFailedError) || !e.driverError || !('code' in e.driverError)) {
        return false;
    }

    return ['23505', 'ER_DUP_ENTRY', 'SQLITE_CONSTRAINT_UNIQUE'].includes(String(e.driverError.code));
}
