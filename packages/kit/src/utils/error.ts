/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from './has-own-property';
import { isObject } from './is-object.ts';

export function isError(e: unknown) : e is Error {
    return isObject(e) && e && hasOwnProperty(e, 'message');
}

export function extractErrorMessage(e: Error) {
    return e.message;
}
