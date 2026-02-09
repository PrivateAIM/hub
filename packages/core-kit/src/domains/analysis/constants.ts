/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AnalysisCommand {
    BUILD_START = 'buildStart',
    BUILD_CHECK = 'buildCheck',

    CONFIGURATION_LOCK = 'configurationLock',
    CONFIGURATION_UNLOCK = 'configurationUnlock',

    DISTRIBUTION_START = 'distributionStart',
    DISTRIBUTION_CHECK = 'distributionCheck',

    STORAGE_CHECK = 'storageCheck',
}
