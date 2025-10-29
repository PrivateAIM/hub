/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import { singa } from 'singa';
import { createAnalysisConfigurationComponent } from './module';

const instance = singa<Component>({
    name: 'analysisConfigurationComponent',
    factory: () => createAnalysisConfigurationComponent(),
});

export function useAnalysisConfigurationComponent(): Component {
    return instance.use();
}
