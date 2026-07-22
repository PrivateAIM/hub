/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createURLCodec } from '@rapiq/codec-url';
import { defineQuery, isQuery } from '@rapiq/core';
import type { IQuery, ObjectLiteral, QueryBuildInput } from '@rapiq/core';

/**
 * Accepted query input for entity read endpoints: either typed build input
 * (desugared via defineQuery) or an already assembled Query.
 */
export type EntityQueryInput<
    T extends ObjectLiteral = ObjectLiteral,
> = QueryBuildInput<T> | IQuery;

const codec = createURLCodec();

/**
 * Serialize entity query input into a URL query string (`?`-prefixed,
 * empty string when there is nothing to transport).
 */
export function buildQueryString<T extends ObjectLiteral>(
    input?: EntityQueryInput<T>,
): string {
    if (!input) {
        return '';
    }

    const query = isQuery(input) ?
        input :
        defineQuery<T>(input);

    const encoded = codec.encode(query);

    return encoded ? `?${encoded}` : '';
}
