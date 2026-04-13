/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { RegistryComponentCaller } from './module.ts';

const instance = singa<RegistryComponentCaller>({
    name: 'registryComponentCaller',
    factory: () => new RegistryComponentCaller(),
});

export function useRegistryComponentCaller(): RegistryComponentCaller {
    return instance.use();
}
