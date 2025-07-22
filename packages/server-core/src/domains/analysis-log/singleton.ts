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
import { AnalysisLogStore } from './module';

const instance = singa<AnalysisLogStore>({
    name: 'analysisLogStore',
    factory: () : AnalysisLogStore => {
        const store = useLogStore();

        return new AnalysisLogStore(store);
    },
});

export function useAnalysisLogStore(): AnalysisLogStore {
    return instance.use();
}
