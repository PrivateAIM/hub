/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { BucketFileComponentEventMap } from '@privateaim/server-storage-kit';
import {
    BucketFileCommand,
} from '@privateaim/server-storage-kit';
import { BucketFileCreateHandler, BucketFileDeleteHandler } from './handlers';

export class BucketFileComponent extends BaseComponent<BucketFileComponentEventMap> {
    constructor() {
        super();

        this.mount(BucketFileCommand.CREATE, new BucketFileCreateHandler());
        this.mount(BucketFileCommand.DELETE, new BucketFileDeleteHandler());
    }

    async start() {
        await this.initialize();
    }
}
