/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AnalysisAPICommand {
    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    DISTRIBUTION_START = 'distributionStart',

    CONFIGURATION_LOCK = 'configurationLock',
    CONFIGURATION_UNLOCK = 'configurationUnlock',
}

// -------------------------------------------------------------------------

export enum AnalysisContainerPath {
    CODE = '/opt/code/',
}
