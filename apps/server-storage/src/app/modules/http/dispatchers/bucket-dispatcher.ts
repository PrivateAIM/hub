/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import { BadRequestError } from '@privateaim/errors';
import type { IDispatcher } from 'hubwire';
import { LocalDispatcher } from 'hubwire';
import type { BucketComponentEventMap } from '@privateaim/server-storage-kit';
import { BucketCommand, BucketEvent } from '@privateaim/server-storage-kit';
import type { IBucketDispatcher } from '../../../../core/entities/index.ts';
import type { BucketComponent } from '../../../components/bucket/module.ts';

export class BucketDispatcherAdapter implements IBucketDispatcher {
    protected dispatcher: LocalDispatcher<BucketComponentEventMap>;

    protected eventDispatcher?: IDispatcher<BucketComponentEventMap>;

    constructor(
        component: BucketComponent,
        eventDispatcher?: IDispatcher<BucketComponentEventMap>,
    ) {
        this.dispatcher = new LocalDispatcher(component);
        this.eventDispatcher = eventDispatcher;
    }

    async create(data: Record<string, any>): Promise<Bucket> {
        const { replies } = await this.dispatcher.dispatch(BucketCommand.CREATE, data);
        const finished = replies.find((reply) => reply.key === BucketEvent.CREATION_FINISHED);
        const failed = replies.find((reply) => reply.key === BucketEvent.CREATION_FAILED);

        if (finished) {
            return finished.data;
        }

        if (failed) {
            throw failed.data.error;
        }

        throw new BadRequestError('Bucket could not be created.');
    }

    async delete(id: string): Promise<Bucket> {
        const { replies } = await this.dispatcher.dispatch(BucketCommand.DELETE, { id });
        const finished = replies.find((reply) => reply.key === BucketEvent.DELETION_FINISHED);
        const failed = replies.find((reply) => reply.key === BucketEvent.DELETION_FAILED);

        if (finished) {
            // in-process run: forward to the bus, so server-core drops its analysis bucket row too.
            await this.eventDispatcher?.dispatch(BucketEvent.DELETION_FINISHED, finished.data, {});
            return finished.data;
        }

        if (failed) {
            throw failed.data.error;
        }

        throw new BadRequestError('Bucket could not be deleted.');
    }

    async clear(id: string): Promise<Bucket> {
        const { replies } = await this.dispatcher.dispatch(BucketCommand.CLEAR, { id });
        const finished = replies.find((reply) => reply.key === BucketEvent.CLEARING_FINISHED);
        const failed = replies.find((reply) => reply.key === BucketEvent.CLEARING_FAILED);

        if (finished) {
            // in-process run: forward to the bus, so server-core drops its file mirror rows too.
            await this.eventDispatcher?.dispatch(BucketEvent.CLEARING_FINISHED, finished.data, {});
            // HTTP callers get the bare bucket; fileIds is bus-only
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fileIds, ...bucket } = finished.data;
            return bucket;
        }

        if (failed) {
            throw failed.data.error;
        }

        throw new BadRequestError('Bucket could not be cleared.');
    }
}
