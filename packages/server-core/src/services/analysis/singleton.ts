/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isQueueRouterUsable } from '@privateaim/server-kit';
import { singa } from 'singa';
import { AnalysisManagerService } from './module';

const instance = singa<AnalysisManagerService>({
    name: 'analysisManager',
    factory: () => new AnalysisManagerService(),
});

export function isAnalysisManagerUsable() {
    return isQueueRouterUsable();
}

export function useAnalysisManager(): AnalysisManagerService {
    return instance.use();
}
