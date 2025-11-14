/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageSynchronizerEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerCommand,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';

import { MasterImageSynchronizerExecuteHandler } from './handlers';

export class MasterImageSynchronizerComponent extends BaseComponent<MasterImageSynchronizerEventMap> {
    constructor() {
        super();

        this.mount(MasterImageSynchronizerCommand.EXECUTE, new MasterImageSynchronizerExecuteHandler());
    }

    async start() {
        await this.initialize();
    }
}
