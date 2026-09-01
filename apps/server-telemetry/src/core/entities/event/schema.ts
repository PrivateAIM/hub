/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Event } from '@privateaim/telemetry-kit';
import { DomainType } from '@privateaim/telemetry-kit';

/**
 * `indexes` declares the QUERY SURFACE, not the table (#1842): every sequence
 * is a leftmost prefix of a real `EventEntity` index (checked by
 * `assertSchemaMatchesEntity` in the parity spec), and every allowed filter or
 * sort key leads one of them, so the `indexed` policies can never reject a key
 * the allow-lists permit. The `(expiring, expiresAt)` retention-sweep index is
 * deliberately NOT declared — `expiring` is not queryable.
 *
 * `createdAt` / `updatedAt` are NOT filterable (the timestamp-filter trap,
 * authup#3429): both are datetime columns behind `dateToISOStringTransformer`,
 * which applies on read but not to a WHERE bind, so equality/ranges compare an
 * ISO string against the driver's native storage format — wrong rows, silently.
 * This deliberately diverges from authup's event schema, which keeps
 * `createdAt` filterable. Sorting `createdAt` is fine (no bind involved).
 *
 * Sorts are `createdAt` only (authup event precedent): events are append-only
 * since #1866, so `updatedAt` always equals `createdAt`, and `expiresAt` is
 * `createdAt` plus a fixed retention window — both were redundant orderings.
 * The `createdAt DESC` default is the soft-failure floor: sorts fail SOFT
 * (the whole parameter is silently replaced by the default), so without one
 * a dropped or no-longer-allowed sort key degrades to NO ordering at all —
 * non-deterministic offset pages — where with it degradation lands on
 * newest-first, which is also the admin events page's order.
 */
export const eventSchema = defineSchema<Event>({
    name: DomainType.EVENT,
    strict: true,
    indexes: [
        ['scope'],
        ['name', 'scope'],
        ['refType', 'refId'],
        ['refId'],
        ['realmId', 'createdAt'],
        ['createdAt'],
    ],
    filters: { allowed: ['scope', 'name', 'refType', 'refId', 'realmId'], indexed: true },
    sorts: {
        allowed: ['createdAt'],
        default: { createdAt: 'DESC' },
        indexed: true,
    },
    pagination: { maxLimit: 50 },
});
