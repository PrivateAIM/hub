/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { Logger } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';

export interface IAnalysisProcessChecker {
    check(input: string | Analysis): Promise<Analysis>;
}

export interface IAnalysisReconciler {
    reconcile(now?: Date): Promise<AnalysisReconcileResult>;
}

export type AnalysisReconcilerContext = {
    repository: IAnalysisRepository;
    builder: IAnalysisProcessChecker;
    distributor: IAnalysisProcessChecker;
    logger?: Logger;
};

export type AnalysisReconcileResult = {
    /**
     * Check commands dispatched.
     */
    checked: number;
    /**
     * Check commands that could not be dispatched (logged).
     */
    failed: number;
};
