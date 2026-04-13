/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { expect } from 'vitest';
import type { ObjectLiteral } from '@privateaim/kit';

export function expectPropertiesEqualToSrc<
    T extends ObjectLiteral = ObjectLiteral,
>(
    src: T,
    dest: Partial<T>,
    ignore?: (keyof T)[],
) {
    const keys = Object.keys(src);
    for (const key of keys) {
        if (typeof ignore !== 'undefined') {
            const index = ignore.indexOf(key);
            if (index !== -1) {
                continue;
            }
        }

        expect(dest[key]).toEqual(src[key]);
    }
}
