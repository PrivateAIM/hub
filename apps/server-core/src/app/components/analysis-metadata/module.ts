/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import { AnalysisMetadataCommand } from './constants.ts';
import { AnalysisMetadataRecalcHandler } from './handlers/index.ts';
import type { AnalysisMetadataEventMap } from './types.ts';

export class AnalysisMetadataComponent extends BaseComponent<AnalysisMetadataEventMap> {
    constructor(ctx: { dataSource: DataSource; config: { env: string; skipAnalysisApproval: boolean } }) {
        super();

        this.mount(AnalysisMetadataCommand.RECALC, new AnalysisMetadataRecalcHandler({ dataSource: ctx.dataSource, config: ctx.config }));
    }

    async start() {
        await this.initialize();
    }
}
