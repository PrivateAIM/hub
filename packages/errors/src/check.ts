/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { matchesInstanceof } from '@ebec/core';
import type { HubError } from './module.ts';
import { HUB_ERROR_INSTANCE } from './module.ts';

/**
 * Duck-type guard for HubError.
 *
 * The `@instanceof` chain decides, and only the chain: it matches when the
 * HubError marker is in it, as the native symbol (in-process) or its
 * serialized string form (JSON-rehydrated). Subclass instances accumulate
 * this marker, so any HubError subclass (`BadRequestError`,
 * `EntityNotFoundError`, ...) matches too, while a foreign `@ebec/core`
 * error (rapiq's `ParseError`, which since 2.2 also carries an `issues`
 * array) does not: it announced its ancestry and HubError is not in it.
 *
 * Chain-less input never matches. A shape-based fallback for pre-chain
 * JSON (`BaseError` + `issues: Issue[]`) used to cover that case, but
 * `@ebec/core`'s `isBaseError` became chain-only, so that fallback could
 * never fire — and now that every `BaseError` carries an `issues` array,
 * the shape it checked for would no longer distinguish a HubError from any
 * other ebec-derived error anyway.
 */
export function isHubError(input: unknown): input is HubError {
    return matchesInstanceof(input, HUB_ERROR_INSTANCE);
}
