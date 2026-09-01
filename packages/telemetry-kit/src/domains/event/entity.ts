/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// todo: add service, trace ?

import type { Realm } from '@authup/core-kit';
import type { ObjectDiff } from '@privateaim/kit';
import type { EventScope } from './constants';

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
     *
     * Deliberately free-form: the vocabulary is the union of three sibling
     * kits' `DomainType`, and typing it here would make this Layer-0 package
     * depend on core-kit AND storage-kit. Every in-tree producer already passes
     * a `DomainType` member. authup makes the same call for the same reason.
     */
    refType: string;

    /**
     * eg. uuid
     */
    refId: string | null;

    /**
     * The producing subsystem. Closed vocabulary — see {@link EventScope}.
     */
    scope: `${EventScope}`;

    /**
     * eg. started, starting, finished, ...
     *
     * Deliberately free-form: the vocabulary is scope-relative — `DomainEventName`
     * under `entity`, a worker component event key under `builder` /
     * `synchronizer` — and those enums live in packages a Layer-0 kit cannot
     * import. Both producers are already narrow at their own call site.
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

    /**
     * Vestigial. Events are append-only — no update route, no EVENT_UPDATE
     * permission, no service method — so this always equals `createdAt`. Kept
     * only because the column ships in the released 1771519574696 migration.
     */
    updatedAt: string;
}
