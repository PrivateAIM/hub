/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AnalysisBuildStatus {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // tb trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // tb trigger

    FINISHED = 'finished', // tb trigger
    FAILED = 'failed', // tb trigger
}

// -------------------------------------------------------------------------

export enum AnalysisConfigurationStatus {
    NODES = 'nodes',
    MASTER_IMAGE = 'masterImage',
    FILES = 'files',
    FINISHED = 'finished',
}

// -------------------------------------------------------------------------

export enum AnalysisRunStatus {
    STARTING = 'starting',
    STARTED = 'started',

    RUNNING = 'running',

    STOPPING = 'stopping',
    STOPPED = 'stopped',

    FINISHED = 'finished',
    FAILED = 'failed',
}

// -------------------------------------------------------------------------

export enum AnalysisResultStatus {
    STARTED = 'started',

    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',

    PROCESSING = 'extracting',
    PROCESSED = 'extracted',

    FINISHED = 'finished',
    FAILED = 'failed',
}

// -------------------------------------------------------------------------

export enum AnalysisAPICommand {
    SPIN_UP = 'spinUp',
    TEAR_DOWN = 'tearDown',

    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    CONFIGURATION_LOCK = 'configurationLock',
    CONFIGURATION_UNLOCK = 'configurationUnlock',
}

// -------------------------------------------------------------------------

export enum AnalysisContainerPath {
    CODE = '/opt/code/',
}
