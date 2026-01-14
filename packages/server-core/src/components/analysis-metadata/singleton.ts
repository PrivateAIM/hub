/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { AnalysisMetadataComponent } from './module.ts';

const instance = singa<AnalysisMetadataComponent>({
    name: 'analysisMetadataComponent',
    factory: () => new AnalysisMetadataComponent(),
});

export function useAnalysisMetadataComponent(): AnalysisMetadataComponent {
    return instance.use();
}
