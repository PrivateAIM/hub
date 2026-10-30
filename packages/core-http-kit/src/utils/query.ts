/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityQueryInput } from './types';
import { createURLCodec } from '@rapiq/codec-url';
import { defineQuery, isQuery } from '@rapiq/core';
import type { ObjectLiteral } from '@rapiq/core';

const codec = createURLCodec();

/**
 * Serialize entity query input into a URL query string (`?`-prefixed,
 * empty string when there is nothing to transport). Filters travel in the
 * rapiq v2 expression dialect; the receiving side decodes them via the URL
 * codec's in-band dialect dispatch.
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
