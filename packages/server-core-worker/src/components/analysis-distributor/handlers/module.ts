/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { ComponentHandlers, type ComponentHandlersOptions } from '@privateaim/server-kit';
import { AnalysisDistributorCommand } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorExecuteHandler } from './execute';

export function defineAnalysisDistributorHandlers(options: ComponentHandlersOptions = {}) : ComponentHandlers {
    const manager = new ComponentHandlers(options);

    manager.mount(AnalysisDistributorCommand.EXECUTE, new AnalysisDistributorExecuteHandler());

    return manager;
}
