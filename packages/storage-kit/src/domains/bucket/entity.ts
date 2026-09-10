/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';

export interface Bucket {
    id: string;

    name: string;

    region: string | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    actorId: string | null;

    actorType: string | null;

    // ------------------------------------------------------------------

    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    /**
     * eg. analysis
     *
     * Deliberately free-form, mirroring telemetry-kit's `Event.refType`: the
     * vocabulary is whatever the creating service's own `DomainType` names,
     * and typing it here would make this Layer-0 package depend on core-kit.
     * Nullable — unlike an event, a bucket the HTTP `POST /buckets` route
     * creates directly has no natural owning resource to name.
     */
    refType: string | null;

    /**
     * eg. uuid
     */
    refId: string | null;

}
