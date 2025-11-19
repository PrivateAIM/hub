/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { RegistryComponent } from './module';

const instance = singa<RegistryComponent>({
    name: 'registryComponent',
    factory: () => new RegistryComponent(),
});

export function useRegistryComponent(): RegistryComponent {
    return instance.use();
}
