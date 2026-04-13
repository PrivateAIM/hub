/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { AnalysisDistributorComponent } from './module';

const instance = singa<AnalysisDistributorComponent>({
    name: 'analysisDistributor',
    factory: () => new AnalysisDistributorComponent(),
});

export function useAnalysisDistributorComponent(): AnalysisDistributorComponent {
    return instance.use();
}
