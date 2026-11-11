/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CapabilityEntry } from '@privateaim/kit';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * A verified capability token, as far as storage judges it: who delegated it
 * (`subject`) and which buckets and files it covers (`entries`). It is not an
 * identity: a capability request has no permission evaluator, so only the
 * entries decide.
 */
export type StorageCapability = {
    subject: {
        id: string,
        type: 'user' | 'client',
        realmId: string,
    },
    entries: CapabilityEntry[],
};

export type StorageRequester = {
    type: 'actor',
    actor: ActorContext,
} | {
    type: 'capability',
    capability: StorageCapability,
};
