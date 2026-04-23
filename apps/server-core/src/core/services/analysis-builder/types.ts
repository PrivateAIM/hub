/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Port for triggering analysis build operations on the worker.
 * Implemented by AnalysisBuilderComponentCaller in server-core-worker-kit.
 */
export interface IAnalysisBuilderCaller {
    callExecute(data: { id: string }): Promise<void>;
    callCheck(data: { id: string }): Promise<void>;
}
