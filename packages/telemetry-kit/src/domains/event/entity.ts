/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// todo: add service, trace ?

import type { Realm } from '@authup/core-kit';
import type { ObjectDiff } from '@privateaim/kit';

export type EventData = {
    diff?: ObjectDiff,
    [key: string]: any
};

export interface Event {
    id: string;

    /**
     * domaine
     *
     * eg. analysis, node, analysisNode, ....
     */
    refType: string;

    /**
     * eg. uuid
     */
    refId: string | null;

    /**
     * component, prozess,
     *
     * eg. build, push, modelChanges, ...
     */
    scope: string;

    /**
     * eg. started, starting, finished, ...
     */
    name: string;

    /**
     *
     * { diff: { description: { next: "xxx", previous: "yyy" }, name {}}}
     */
    data: Record<string, any>;

    /**
     * default: false
     */
    expiring: boolean;

    // ------------------------------------------------------------------

    requestPath: string | null;

    requestMethod: string | null;

    requestIpAddress: string | null;

    requestUserAgent: string | null;

    // ------------------------------------------------------------------

    actorType: string | null;

    actorId: string | null;

    actorName: string | null;

    // ------------------------------------------------------------------

    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    expiresAt: string | null;

    createdAt: string;

    updatedAt: string;
}
