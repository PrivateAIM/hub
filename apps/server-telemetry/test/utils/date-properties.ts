/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';

export function removeDateProperties<
    T extends Record<string, any>,
>(input: T) : T {
    if (hasOwnProperty(input, 'createdAt')) {
        delete input.createdAt;
    }

    if (hasOwnProperty(input, 'updatedAt')) {
        delete input.updatedAt;
    }

    // todo: remove other date values.

    return input;
}
