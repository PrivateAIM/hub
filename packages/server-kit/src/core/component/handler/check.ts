/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';
import { hasOwnProperty } from '../../../utils';

import type { ComponentHandler, ComponentHandlerFn } from './types';

export function isComponentHandler(input: unknown) : input is ComponentHandler {
    if (!isObject(input)) {
        return false;
    }

    return !(!hasOwnProperty(input, 'execute') || typeof input.execute !== 'function');
}

export function isComponentHandlerFn(input: unknown) : input is ComponentHandlerFn {
    return typeof input === 'function';
}
