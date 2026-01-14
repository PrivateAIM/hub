/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isQueueRouterUsable } from '@privateaim/server-kit';
import { singa } from 'singa';
import { AnalysisDistributor } from './module.ts';

const instance = singa<AnalysisDistributor>({
    name: 'analysisManager',
    factory: () => new AnalysisDistributor(),
});

export function isAnalysisManagerUsable() {
    return isQueueRouterUsable();
}

export function useAnalysisManager(): AnalysisDistributor {
    return instance.use();
}
