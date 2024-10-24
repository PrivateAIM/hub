/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { MasterImageService } from './module';

const instance = singa<MasterImageService>({
    name: 'masterImage',
    factory: () => new MasterImageService(),
});

export function useMasterImageService() {
    return instance.use();
}
