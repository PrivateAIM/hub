/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildAuthupAggregator, buildTrainManagerAggregator } from '../aggregators';
import { hasAmqpClient } from '../core';
import { EnvironmentName, useEnv } from './env';

import { buildRouterComponent } from '../components';
import { getWritableDirPath } from './paths';
import {
    configureAmqp, configureAuthup, configureRedis, configureVault, setupLogger,
} from './services';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
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
    if (!isTest && hasAmqpClient()) {
        aggregators.push(buildAuthupAggregator());
        aggregators.push(buildTrainManagerAggregator());
    }

    // ---------------------------------------------

    const components : {start: () => void}[] = [];
    if (!isTest && hasAmqpClient()) {
        components.push(
            buildRouterComponent(),
        );
    }

    return {
        aggregators,
        components,
    };
}
