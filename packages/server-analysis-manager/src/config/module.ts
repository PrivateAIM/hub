/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuilderCommandContext, CoreCommandContext } from '@privateaim/server-analysis-manager-kit';
import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import type { Aggregator, Component } from '@privateaim/server-kit';
import { createQueueRouterComponent, guessAuthupTokenCreatorOptions } from '@privateaim/server-kit';
import {
    executeBuilderCommand, executeCoreCommand,
} from '../components';
import {
    configureAMQP, configureCoreService, configureStorageService, setupLogger, setupVault,
} from './services';
import type { Config } from './types';

export function createConfig() : Config {
    setupLogger();
    setupVault();
    configureAMQP();

    const tokenCreator = guessAuthupTokenCreatorOptions();
    configureStorageService({ tokenCreator });
    configureCoreService({ tokenCreator });

    const aggregators : Aggregator[] = [];

    const components : Component[] = [
        createQueueRouterComponent({
            routingKey: 'tm.router',
            handlers: {
                [ComponentName.BUILDER]: (ctx: BuilderCommandContext) => executeBuilderCommand(ctx),
                [ComponentName.CORE]: (ctx: CoreCommandContext) => executeCoreCommand(ctx),
            },
        }),
    ];

    return {
        aggregators,
        components,
    };
}

export default createConfig;
