/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import { BadRequestError } from '@ebec/http';
import { DirectComponentCaller } from '@privateaim/server-kit';
import { BucketCommand } from '@privateaim/server-storage-kit';
import type { IBucketCaller } from '../../../../core/entities/index.ts';
import type { BucketComponent } from '../../../components/bucket/module.ts';

export class BucketCallerAdapter implements IBucketCaller {
    protected component: BucketComponent;

    constructor(component: BucketComponent) {
        this.component = component;
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
}
