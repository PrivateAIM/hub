/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestIdentity } from '@privateaim/server-http-kit';
import type { Bucket } from '@privateaim/storage-kit';

export { toBucketName } from '../../../core/utils/bucket-name.ts';

export function isBucketOwnedByIdentity(entity: Bucket, actor: RequestIdentity) {
    return entity.actor_type === actor.type &&
        entity.actor_id === actor.id;
}
