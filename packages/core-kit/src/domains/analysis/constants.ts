/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AnalysisAPICommand {
    BUILD_START = 'buildStart',
    BUILD_STATUS = 'buildCheck',

    DISTRIBUTION_START = 'distributionStart',
    DISTRIBUTION_CHECK = 'distributionCheck',

    CONFIGURATION_LOCK = 'configurationLock',
    CONFIGURATION_UNLOCK = 'configurationUnlock',
}
