/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ValueTransformer } from 'typeorm';

/**
 * TypeORM hydrates `datetime` columns (incl. `@CreateDateColumn` /
 * `@UpdateDateColumn`) to JS `Date` objects by default — `pg`/`mysql2` return
 * `Date` natively, and the sqlite driver normalizes the stored string to a
 * `Date`. This transformer normalizes the read value to an ISO-8601 `string`,
 * so the in-process runtime type matches the entity's declared `string` type
 * *and* the JSON form delivered to clients — one timestamp type across backend
 * and frontend, with no per-consumer re-hydration.
 *
 * Writes pass the value through unchanged; TypeORM serializes a `Date` or an
 * ISO string to the underlying column type as usual.
 */
export const dateToISOStringTransformer: ValueTransformer = {
    to(value: Date | string | null | undefined): Date | string | null | undefined {
        return value;
    },
    from(value: Date | string | null | undefined): string | null | undefined {
        if (value instanceof Date) {
            return value.toISOString();
        }

        return value;
    },
};
