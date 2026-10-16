/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityPersistContext } from '@privateaim/server-kit';

export type AnalysisBuilderStartOptions = {
    ignoreApproval?: boolean;
    persistCtx?: EntityPersistContext;
};

/**
 * Port for triggering analysis build operations on the worker.
 * Implemented by AnalysisBuilderComponentDispatcher in server-core-worker-kit.
 */
export interface IAnalysisBuilderDispatcher {
    dispatchExecute(data: { id: string }): Promise<void>;
    dispatchCheck(data: { id: string }): Promise<void>;
}
