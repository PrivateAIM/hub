/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { AnalysisBuilderComponent } from './module';

const instance = singa<AnalysisBuilderComponent>({
    name: 'analysisBuilder',
    factory: () => new AnalysisBuilderComponent(),
});

export function useAnalysisBuilderComponent(): AnalysisBuilderComponent {
    return instance.use();
}
