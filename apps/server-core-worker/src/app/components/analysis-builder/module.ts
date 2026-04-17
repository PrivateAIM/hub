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
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { APIClient as StorageClient } from '@privateaim/storage-kit';
import type { Client as DockerClient } from 'docken';

import { AnalysisBuilderCheckHandler, AnalysisBuilderExecuteHandler } from './handlers';

export class AnalysisBuilderComponent extends BaseComponent<AnalysisBuilderEventMap> {
    constructor(ctx: {
        coreClient: CoreClient; 
        storageClient: StorageClient; 
        docker: DockerClient 
    }) {
        super();

        this.mount(AnalysisBuilderCommand.CHECK, new AnalysisBuilderCheckHandler({
            coreClient: ctx.coreClient,
            docker: ctx.docker,
        }));
        this.mount(AnalysisBuilderCommand.EXECUTE, new AnalysisBuilderExecuteHandler({
            coreClient: ctx.coreClient,
            storageClient: ctx.storageClient,
            docker: ctx.docker,
        }));
    }

    async start() {
        await this.initialize();
    }
}
