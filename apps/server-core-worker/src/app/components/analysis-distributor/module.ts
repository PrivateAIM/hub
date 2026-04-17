/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { Logger } from '@privateaim/server-kit';
import type { AnalysisDistributorEventMap } from '@privateaim/server-core-worker-kit';
import {
    AnalysisDistributorCommand,
} from '@privateaim/server-core-worker-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { Client as DockerClient } from 'docken';
import { AnalysisDistributorCheckHandler, AnalysisDistributorExecuteHandler } from './handlers';

export class AnalysisDistributorComponent extends BaseComponent<AnalysisDistributorEventMap> {
    constructor(ctx: {
        coreClient: CoreClient; 
        docker: DockerClient; 
        logger?: Logger 
    }) {
        super();

        this.mount(AnalysisDistributorCommand.CHECK, new AnalysisDistributorCheckHandler({
            coreClient: ctx.coreClient,
            docker: ctx.docker,
            logger: ctx.logger,
        }));
        this.mount(AnalysisDistributorCommand.EXECUTE, new AnalysisDistributorExecuteHandler({
            coreClient: ctx.coreClient,
            docker: ctx.docker,
            logger: ctx.logger,
        }));
    }

    async start() {
        await this.initialize();
    }
}
