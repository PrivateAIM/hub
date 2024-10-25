/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { MasterImageQueueService } from './module';

const instance = singa<MasterImageQueueService>({
    name: 'masterImageQueue',
    factory: () => new MasterImageQueueService(),
});

export function useMasterImageQueueService() {
    return instance.use();
}
