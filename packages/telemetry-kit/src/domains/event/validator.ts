/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { TypedContainer, isObject } from '@privateaim/kit';
import zod from 'zod';
import { EventScope } from './constants';
import type { Event, EventData } from './entity';

/**
 * Secret denylist for event `data` keys, applied at BOTH ends of the audit
 * pipeline: where the entity diff is built ({@link EntityEventHandler}) and
 * where an event row is written (this validator). Fail-closed — losing a
 * "buildHash changed" line from the audit trail is acceptable, persisting a
 * Harbor robot secret is not. Kept byte-identical to authup's
 * EVENT_DIFF_SECRET_KEY_REGEX so the two can be compared by eye.
 */
export const EVENT_DATA_SECRET_KEY_REGEX = /(password|secret|hash|token|credential)/i;

function isScalar(value: unknown): value is string | number | boolean | null {
    return value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean';
}

/**
 * `diff` survives only as a one-level map of `{ next, previous }` scalar pairs.
 * An entry whose `previous` is not a scalar is DROPPED rather than recorded:
 * the pre-image of an update is the row loaded from the database, so an absent
 * `previous` is exactly what a `select: false` credential column looks like.
 * Deliberately stricter than `ObjectDiff`, which types `previous` as optional.
 */
function sanitizeDiff(input: unknown) {
    const output: Record<string, { next: unknown, previous: unknown }> = {};
    if (!isObject(input)) {
        return output;
    }

    for (const [key, entry] of Object.entries(input)) {
        if (EVENT_DATA_SECRET_KEY_REGEX.test(key) || !isObject(entry)) {
            continue;
        }

        if (!isScalar(entry.next) || !isScalar(entry.previous)) {
            continue;
        }

        output[key] = { next: entry.next, previous: entry.previous };
    }

    return output;
}

/**
 * The PII/credential write boundary for an event's `data` bag. Fail-closed: an
 * unrecognised shape is dropped, never passed through. Returns `{}` for an
 * empty object (not `null`, unlike authup) so the shape the entity-event bridge
 * already persists on create/delete events is unchanged.
 */
export function sanitizeEventData(input: unknown): EventData | null {
    if (!isObject(input)) {
        return null;
    }

    const output: EventData = {};

    for (const [key, value] of Object.entries(input)) {
        if (EVENT_DATA_SECRET_KEY_REGEX.test(key)) {
            continue;
        }

        if (key === 'diff') {
            output.diff = sanitizeDiff(value);
            continue;
        }

        if (isScalar(value)) {
            output[key] = value;
        }
    }

    return output;
}

/**
 * A client-controlled string bounded by TRUNCATION rather than rejection.
 *
 * These values arrive verbatim from the request (the `user-agent` header, the
 * request path, the actor name), so a bound that THROWS lets a caller suppress
 * its own audit record: the validator error is caught by
 * `EventComponentCreateHandler`, which emits `creationFailed` and drops the row
 * entirely. A crawler sending a 600-character user agent would erase every event
 * it triggers. Degrade the field, never the record — the same reason
 * `requestIpAddress` carries `.catch(null)`.
 *
 * The producer-controlled vocabulary (`scope`, `name`, `refType`,
 * `requestMethod`, `actorType`) deliberately keeps throwing: there a reject is
 * the point.
 */
function truncated(max: number) {
    return zod
        .string()
        .nullable()
        .transform((value) => (value ? value.slice(0, max) : value));
}

export class EventValidator extends TypedContainer<Event> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'refType',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(64),
            ),
        );

        this.mount(
            'refId',
            { optional: true },
            createValidator(
                zod
                    .uuidv4()
                    .nullable(),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'scope',
            createValidator(zod.enum(EventScope)),
        );

        this.mount(
            'name',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(64),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'data',
            { optional: true },
            createValidator(
                zod
                    .record(zod.string(), zod.any())
                    .nullable()
                    // The credential/PII write boundary. BOTH write paths into
                    // the `events` table run this validator — HTTP
                    // `EventService.create` and the AMQP
                    // `EventComponentCreateHandler` — so sanitizing here cannot
                    // be bypassed by a third path.
                    .transform(sanitizeEventData),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'expiring',
            { optional: true },
            createValidator(
                zod
                    .boolean(),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'requestPath',
            { optional: true },
            createValidator(truncated(256)),
        );

        this.mount(
            'requestMethod',
            { optional: true },
            createValidator(zod.string().min(3).max(10).nullable()),
        );

        this.mount(
            'requestIpAddress',
            { optional: true },
            // v4+v6. `.catch(null)` degrades the FIELD on an unparseable
            // address instead of throwing, which would discard the whole audit
            // record: the value is the leftmost X-Forwarded-For entry verbatim
            // (getRequestIP with trustProxy: true), i.e. fully client-controlled.
            createValidator(zod.union([zod.ipv4(), zod.ipv6()]).nullable().catch(null)),
        );

        this.mount(
            'requestUserAgent',
            { optional: true },
            createValidator(truncated(512)),
        );

        // ----------------------------------------------

        this.mount(
            'actorType',
            { optional: true },
            createValidator(zod.string().min(3).max(64).nullable()),
        );

        this.mount(
            'actorId',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        this.mount(
            'actorName',
            { optional: true },
            createValidator(truncated(64)),
        );

        // ----------------------------------------------

        this.mount(
            'realmId',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'expiresAt',
            { optional: true },
            createValidator(
                zod.iso.datetime()
                    .max(28)
                    .nullable(),
            ),
        );
    }
}
