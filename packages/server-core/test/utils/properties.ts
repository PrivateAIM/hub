/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';

export function expectSrcProperties(
    src: Record<string, any>,
    dest: Record<string, any>,
) {
    const keys = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
        if (!hasOwnProperty(dest, keys[i])) {
            continue;
        }

        expect(dest[keys[i]]).toEqual(src[keys[i]]);
    }
}
