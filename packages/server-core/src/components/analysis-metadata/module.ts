/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import { AnalysisMetadataCommand } from './constants';
import { AnalysisMetadataRecalcHandler } from './handlers';
import type { AnalysisMetadataTaskMap } from './types';

export class AnalysisMetadataComponent extends BaseComponent<AnalysisMetadataTaskMap> {
    constructor() {
        super();

        this.mount(AnalysisMetadataCommand.RECALC, new AnalysisMetadataRecalcHandler());
    }

    async start() {
        await this.initialize();
    }
}
