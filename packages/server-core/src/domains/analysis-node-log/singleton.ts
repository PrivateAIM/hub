/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    useLogStore,
} from '@privateaim/server-kit';
import { singa } from 'singa';
import { AnalysisNodeLogStore } from './module';

const instance = singa<AnalysisNodeLogStore>({
    name: 'analysisNodeLogStore',
    factory: () : AnalysisNodeLogStore => {
        const store = useLogStore();

        return new AnalysisNodeLogStore(store);
    },
});

export function useAnalysisNodeLogStore(): AnalysisNodeLogStore {
    return instance.use();
}
