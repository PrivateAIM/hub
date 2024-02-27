/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Actor } from '../actor';
import type { BucketFileEntity } from './entity';

export function isBucketFileOwnedByActor(entity: BucketFileEntity, actor: Actor) {
    return entity.actor_type === actor.type &&
        entity.actor_id === actor.id;
}
