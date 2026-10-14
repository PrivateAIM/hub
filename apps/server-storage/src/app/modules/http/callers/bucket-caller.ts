/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import { BadRequestError } from '@privateaim/errors';
import type { MessageBusDispatchComponentCaller } from '@privateaim/server-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import type { BucketComponentEventMap } from '@privateaim/server-storage-kit';
import { BucketCommand, BucketEvent } from '@privateaim/server-storage-kit';
import type { IBucketCaller } from '../../../../core/entities/index.ts';
import type { BucketComponent } from '../../../components/bucket/module.ts';

export class BucketCallerAdapter implements IBucketCaller {
    protected component: BucketComponent;

    protected eventCaller?: MessageBusDispatchComponentCaller<BucketComponentEventMap>;

    constructor(
        component: BucketComponent,
        eventCaller?: MessageBusDispatchComponentCaller<BucketComponentEventMap>,
    ) {
        this.component = component;
        this.eventCaller = eventCaller;
    }

    async create(data: Record<string, any>): Promise<Bucket> {
        const caller = new DirectComponentCaller(this.component);
        const output = await caller.callAndWait(BucketCommand.CREATE, data, {});

        if (output.creationFinished) {
            return output.creationFinished;
        }

        if (output.creationFailed) {
            throw output.creationFailed.error;
        }

        throw new BadRequestError('Bucket could not be created.');
    }

    async delete(id: string): Promise<Bucket> {
        const caller = new DirectComponentCaller(this.component);
        const output = await caller.callAndWait(BucketCommand.DELETE, { id }, {});

        if (output.deletionFinished) {
            return output.deletionFinished;
        }

        if (output.deletionFailed) {
            throw output.deletionFailed.error;
        }

        throw new BadRequestError('Bucket could not be deleted.');
    }

    async clear(id: string): Promise<Bucket> {
        const caller = new DirectComponentCaller(this.component);
        const output = await caller.callAndWait(BucketCommand.CLEAR, { id }, {});

        if (output.clearingFinished) {
            // in-process run: forward to the bus, so server-core drops its file mirror rows too.
            await this.eventCaller?.call(BucketEvent.CLEARING_FINISHED, output.clearingFinished, {});
            // HTTP callers get the bare bucket; fileIds is bus-only
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fileIds, ...bucket } = output.clearingFinished;
            return bucket;
        }

        if (output.clearingFailed) {
            throw output.clearingFailed.error;
        }

        throw new BadRequestError('Bucket could not be cleared.');
    }
}
