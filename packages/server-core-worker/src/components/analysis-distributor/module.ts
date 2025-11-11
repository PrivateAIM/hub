/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import {
    AnalysisDistributorCommand,
} from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorExecuteHandler } from './handlers';

export class AnalysisDistributorComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisDistributorCommand.EXECUTE, new AnalysisDistributorExecuteHandler());
    }

    async start() {
        await this.initialize();
    }
}
