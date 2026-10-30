/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery, ObjectLiteral, QueryBuildInput } from '@rapiq/core';

/**
 * Accepted query input for entity read endpoints: either typed build input
 * (desugared via defineQuery) or an already assembled Query.
 */
export type EntityQueryInput<
    T extends ObjectLiteral = ObjectLiteral,
> = QueryBuildInput<T> | IQuery;
