/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandlersOptions } from '@privateaim/server-kit';
import { ComponentHandlers } from '@privateaim/server-kit';
import { AnalysisBuilderCommand } from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderExecuteHandler } from './execute';
import { AnalysisBuilderCheckHandler } from './check';

export function defineAnalysisBuilderHandlers(options: ComponentHandlersOptions = {}) : ComponentHandlers {
    const manager = new ComponentHandlers(options);

    manager.mount(AnalysisBuilderCommand.CHECK, new AnalysisBuilderCheckHandler());
    manager.mount(AnalysisBuilderCommand.EXECUTE, new AnalysisBuilderExecuteHandler());

    return manager;
}
