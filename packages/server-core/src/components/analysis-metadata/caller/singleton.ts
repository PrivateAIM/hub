/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { AnalysisMetadataComponentCaller } from './module.ts';

const instance = singa<AnalysisMetadataComponentCaller>({
    name: 'analysisMetadataComponentCaller',
    factory: () => new AnalysisMetadataComponentCaller(),
});

export function useAnalysisMetadataComponentCaller(): AnalysisMetadataComponentCaller {
    return instance.use();
}
