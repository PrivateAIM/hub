/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Port for triggering analysis distribution operations on the worker.
 * Implemented by AnalysisDistributorComponentDispatcher in server-core-worker-kit.
 */
export interface IAnalysisDistributorDispatcher {
    dispatchExecute(data: { id: string }): Promise<void>;
    dispatchCheck(data: { id: string }): Promise<void>;
}
