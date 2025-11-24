/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBuilderEventMap } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderCommand,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';

import { AnalysisBuilderCheckHandler, AnalysisBuilderExecuteHandler } from './handlers';

export class AnalysisBuilderComponent extends BaseComponent<AnalysisBuilderEventMap> {
    constructor() {
        super();

        this.mount(AnalysisBuilderCommand.CHECK, new AnalysisBuilderCheckHandler());
        this.mount(AnalysisBuilderCommand.EXECUTE, new AnalysisBuilderExecuteHandler());
    }

    async start() {
        await this.initialize();
    }
}
