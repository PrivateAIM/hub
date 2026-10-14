/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';

/**
 * A worker's STARTED/PROGRESS event must not resurrect a process that has
 * already ended (late or redelivered message). Only the command path, which
 * sets STARTING, may leave a terminal status.
 */
export function isProcessStatusTerminal(status: `${ProcessStatus}` | null | undefined): boolean {
    return status === ProcessStatus.EXECUTED ||
        status === ProcessStatus.FAILED ||
        status === ProcessStatus.STOPPED;
}
