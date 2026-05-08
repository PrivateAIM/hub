/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { BucketFileComponentEventMap } from '@privateaim/server-storage-kit';
import {
    BucketFileCommand,
} from '@privateaim/server-storage-kit';
import type { StorageAdapter } from '../../../core/storage/types.ts';
import { BucketFileCreateHandler, BucketFileDeleteHandler } from './handlers/index.ts';

export class BucketFileComponent extends BaseComponent<BucketFileComponentEventMap> {
    constructor(ctx: { storage: StorageAdapter; logger?: Logger }) {
        super();

        this.mount(BucketFileCommand.CREATE, new BucketFileCreateHandler({ storage: ctx.storage, logger: ctx.logger }));
        this.mount(BucketFileCommand.DELETE, new BucketFileDeleteHandler({ storage: ctx.storage, logger: ctx.logger }));
    }

    async start() {
        await this.initialize();
    }
}
