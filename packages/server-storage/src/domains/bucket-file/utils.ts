/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestIdentity } from '@privateaim/server-http-kit';
import type { BucketFileEntity } from './entity';

export function isBucketFileOwnedByIdentity(entity: BucketFileEntity, actor: RequestIdentity) {
    return entity.actor_type === actor.type &&
        entity.actor_id === actor.id;
}
