/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { deserialize, serialize } from '@authup/kit';
import type { ValueTransformer } from 'typeorm';

/**
 * Persists a structured value into a nullable `text` column.
 *
 * `serialize()` from `@authup/kit` returns the STRING `'null'` for `null` and the
 * STRING `'undefined'` for `undefined`, so the bare `{ to: serialize, from: deserialize }`
 * pair writes literal `null` / `undefined` TEXT into a column that then never becomes
 * SQL NULL — an omitted property included, since typeorm still runs `to()` for it.
 * `deserialize()` round-trips the text, so the application cannot see the damage, but
 * `IS NULL` / `IS NOT NULL` (and typeorm's `IsNull()`) match the exact opposite set of
 * rows. `to()` therefore short-circuits both empty values to a real `null`.
 *
 * `from()` coalesces to `null` so a row written BEFORE this transformer — one holding
 * the text `'null'` or `'undefined'` — still hydrates as `null` and honours the column's
 * declared `| null` property type. That is what makes a data backfill unnecessary.
 *
 * Two things must NOT be "simplified":
 * - `to({})` deliberately stays `'{}'`. An empty object is a real value — the telemetry
 *   `EntityEventHandler` writes exactly that — not an absent one. Test emptiness of the
 *   VALUE (`null` / `undefined`), never truthiness, or `{}`, `false` and `0` all become NULL.
 * - `serialize` is not `JSON.stringify`: it passes a raw string through UNQUOTED, which is
 *   what messenger's base64 `data` payload depends on.
 */
export const serializedTextTransformer: ValueTransformer = {
    to(value: unknown): string | null {
        return typeof value === 'undefined' || value === null ? null : serialize(value);
    },
    from(value: string | null): any {
        return deserialize(value) ?? null;
    },
};
