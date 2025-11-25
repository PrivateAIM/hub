/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';

export function expectPropertiesEqualToSrc(
    src: Record<string, any>,
    dest: Record<string, any>,
) {
    const keys = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (isObject(src[key])) {
            continue;
        }

        expect(dest[key]).toEqual(src[key]);
    }
}
