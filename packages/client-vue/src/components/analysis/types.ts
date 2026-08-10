/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type AnalysisStageState = 'done' | 'run' | 'fail' | 'wait' | 'idle';

export type AnalysisStage = {
    key: string,
    label: string,
    state: AnalysisStageState,
    sub: string,
    icon: string | null
};
