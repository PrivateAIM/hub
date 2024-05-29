/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@privateaim/server-kit';
import { isAmqpClientUsable } from '@privateaim/server-kit';
import { buildAuthupAggregator, buildTrainManagerAggregator } from '../aggregators';
import { EnvironmentName, useEnv } from './env';
import {
    createRegistryComponent,
} from '../components';
import { getWritableDirPath } from './paths';
import {
    configureAmqp, configureAuthup, configureRedis, configureVault, setupLogger,
} from './services';

export type Config = {
    aggregators: Aggregator[]
    components: Component[]
};

export function createConfig() : Config {
    setupLogger({
        directory: getWritableDirPath(),
    });

    configureVault();

    configureAuthup();

    configureRedis();

    configureAmqp();

    // ---------------------------------------------

    const isTest = useEnv('env') === EnvironmentName.TEST;

    // ---------------------------------------------

    const aggregators : {start: () => void}[] = [];
    if (!isTest && isAmqpClientUsable()) {
        aggregators.push(buildAuthupAggregator());
        aggregators.push(buildTrainManagerAggregator());
    }

    // ---------------------------------------------

    const components : {start: () => void}[] = [
        createRegistryComponent(),
    ];

    return {
        aggregators,
        components,
    };
}
