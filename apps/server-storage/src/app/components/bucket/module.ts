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
import type {
    BucketComponentEventMap,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,
} from '@privateaim/server-storage-kit';
import type { Client } from 'minio';
import { BucketCreateHandler, BucketDeleteHandler } from './handlers/index.ts';

export class BucketComponent extends BaseComponent<BucketComponentEventMap> {
    constructor(ctx: { minio: Client; logger?: Logger }) {
        super();

        this.mount(BucketCommand.CREATE, new BucketCreateHandler({ minio: ctx.minio, logger: ctx.logger }));
        this.mount(BucketCommand.DELETE, new BucketDeleteHandler({ minio: ctx.minio, logger: ctx.logger }));
    }

    async start() {
        await this.initialize();
    }
}
