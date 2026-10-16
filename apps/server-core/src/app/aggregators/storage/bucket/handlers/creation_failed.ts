/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType, parseAnalysisBucketName } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler } from 'hubwire';
import type {
    BucketComponentEventMap,
    BucketCreationFailedEventPayload,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { StorageBucketAggregatorContext } from '../types.ts';

export class StorageBucketCreationFailedHandler implements ComponentHandler<
    BucketComponentEventMap,
    BucketEvent.CREATION_FAILED
> {
    protected logger?: Logger;

    constructor(ctx: StorageBucketAggregatorContext) {
        this.logger = ctx.logger;
    }

    async handle(payload: BucketCreationFailedEventPayload): Promise<void> {
        // nothing persisted: there is no bucket status, a later storage check retries.
        const message = `Bucket creation failed: ${payload.error?.message}`;
        const parsed = payload.refType === DomainType.ANALYSIS && payload.name ?
            parseAnalysisBucketName(payload.name) :
            null;

        if (!parsed || parsed.analysisId !== payload.refId) {
            this.logger?.error(message);
            return;
        }

        this.logger?.error(message, {
            [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
            [LogFlag.REF_ID]: parsed.analysisId,
            bucketType: parsed.type,
        });
    }
}
