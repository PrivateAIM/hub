/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { BucketComponent } from './module.ts';

const instance = singa<BucketComponent>({
    name: 'bucket',
    factory: () => new BucketComponent(),
});

export function useBucketComponent(): BucketComponent {
    return instance.use();
}
