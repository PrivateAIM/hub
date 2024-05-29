/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/core';
import type { ComponentError } from './error';

export function isComponentError(input: unknown) : input is ComponentError {
    if (!isObject(input)) {
        return false;
    }

    if (
        typeof input.message !== 'undefined' &&
        typeof input.message !== 'string'
    ) {
        return false;
    }

    if (typeof input.code === 'undefined') {
        return true;
    }

    return typeof input.code === 'string' || input.code === null;
}
