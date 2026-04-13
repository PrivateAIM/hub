/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import type {
    BucketComponentEventMap,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,
} from '@privateaim/server-storage-kit';
import { BucketCreateHandler, BucketDeleteHandler } from './handlers/index.ts';

export class BucketComponent extends BaseComponent<BucketComponentEventMap> {
    constructor() {
        super();

        this.mount(BucketCommand.CREATE, new BucketCreateHandler());
        this.mount(BucketCommand.DELETE, new BucketDeleteHandler());
    }

    async start() {
        await this.initialize();
    }
}
