/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { BucketFileComponent } from './module';

const instance = singa<BucketFileComponent>({
    name: 'bucketFile',
    factory: () => new BucketFileComponent(),
});

export function useBucketFileComponent(): BucketFileComponent {
    return instance.use();
}
