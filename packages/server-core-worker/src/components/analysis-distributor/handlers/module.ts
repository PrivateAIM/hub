/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { ComponentHandlers } from '@privateaim/server-kit';
import { AnalysisDistributorCommand } from '@privateaim/server-core-worker-kit';
import { QueueRouterComponentEmitter } from '@privateaim/server-kit/src/core/component/emitter';
import { AnalysisDistributorExecuteHandler } from './execute';

export function defineAnalysisDistributorHandlers() : ComponentHandlers {
    const manager = new ComponentHandlers({
        emitter: new QueueRouterComponentEmitter(),
    });

    manager.mount(AnalysisDistributorCommand.EXECUTE, new AnalysisDistributorExecuteHandler());

    return manager;
}
