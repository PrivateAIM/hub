/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Port for triggering analysis distribution operations on the worker.
 * Implemented by AnalysisDistributorComponentCaller in server-core-worker-kit.
 */
export interface IAnalysisDistributorCaller {
    callExecute(data: { id: string }): Promise<void>;
    callCheck(data: { id: string }): Promise<void>;
}
