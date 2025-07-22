/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { MasterImageEventService } from './module';

const instance = singa<MasterImageEventService>({
    name: 'masterImage',
    factory: () => new MasterImageEventService(),
});

export function useMasterImageService() {
    return instance.use();
}
