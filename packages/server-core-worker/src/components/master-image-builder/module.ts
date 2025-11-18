/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageBuilderEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageBuilderCommand,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';

import { MasterImageBuilderExecuteHandler } from './handlers';

export class MasterImageBuilderComponent extends BaseComponent<MasterImageBuilderEventMap> {
    constructor() {
        super();

        this.mount(MasterImageBuilderCommand.EXECUTE, new MasterImageBuilderExecuteHandler());
    }

    async start() {
        await this.initialize();
    }
}
