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
import type { Client } from 'minio';
import { BucketFileCreateHandler, BucketFileDeleteHandler } from './handlers/index.ts';

export class BucketFileComponent extends BaseComponent<BucketFileComponentEventMap> {
    constructor(ctx: { minio: Client; logger?: Logger }) {
        super();

        this.mount(BucketFileCommand.CREATE, new BucketFileCreateHandler({ minio: ctx.minio, logger: ctx.logger }));
        this.mount(BucketFileCommand.DELETE, new BucketFileDeleteHandler({ minio: ctx.minio, logger: ctx.logger }));
    }

    async start() {
        await this.initialize();
    }
}
