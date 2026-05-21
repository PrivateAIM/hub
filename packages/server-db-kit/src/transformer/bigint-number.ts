/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ValueTransformer } from 'typeorm';

/**
 * TypeORM returns `bigint` columns as JS strings by default (both `pg` and
 * `mysql2`) to avoid silent precision loss. This transformer normalizes the
 * column to a `number | null` on read and validates the same invariant on
 * write.
 *
 * Both directions throw if the value cannot be represented exactly as a JS
 * number (i.e. exceeds `Number.MAX_SAFE_INTEGER`, ≈ 9 PB), so precision loss
 * is loud rather than silently persisted. Guarding `to()` also catches the
 * problem at the write site, where the stack trace points to the caller
 * instead of a downstream reader.
 */
export const bigintNumberTransformer: ValueTransformer = {
    to(value: number | null | undefined): number | null | undefined {
        if (typeof value === 'number' && !Number.isSafeInteger(value)) {
            throw new Error(
                `bigint value "${value}" exceeds Number.MAX_SAFE_INTEGER and cannot be represented as a JS number`,
            );
        }
        return value;
    },
    from(value: string | number | null | undefined): number | null {
        if (value === null || typeof value === 'undefined') {
            return null;
        }

        const parsed = typeof value === 'number' ? value : Number(value);
        if (!Number.isSafeInteger(parsed)) {
            throw new Error(
                `bigint value "${value}" exceeds Number.MAX_SAFE_INTEGER and cannot be represented as a JS number`,
            );
        }

        return parsed;
    },
};
