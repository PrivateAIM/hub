/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ActorContext } from './actor/types.ts';

export abstract class AbstractEntityService {
    protected getActorRealmId(actor: ActorContext): string | undefined {
        return actor.realm?.id;
    }
}
