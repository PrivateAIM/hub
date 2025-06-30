/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthupClientUsable, isLokiClientUsable, useLokiClient } from '@privateaim/server-kit';
import { singa } from 'singa';
import type { AnalysisNodeLogStore } from './types';
import { AnalysisNodeLogDatabaseStore, AnalysisNodeLogLokiStore } from './entities';

const instance = singa<AnalysisNodeLogStore>({
    name: 'analysisNodeLogStore',
    factory: () : AnalysisNodeLogStore => {
        if (isLokiClientUsable()) {
            return new AnalysisNodeLogLokiStore(useLokiClient());
        }

        return new AnalysisNodeLogDatabaseStore();
    },
});

export function isAnalysisNodeLogStoreUsable() {
    return isAuthupClientUsable();
}

export function useAnalysisNodeLogStore(): AnalysisNodeLogStore {
    return instance.use();
}
