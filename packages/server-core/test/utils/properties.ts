/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { expect } from 'vitest';
import type { ObjectLiteral } from '@privateaim/kit';
import { hasOwnProperty } from '@privateaim/kit';

type ExpectPropertiesOptions<T extends ObjectLiteral = ObjectLiteral> = {
    /**
     * default: undefined
     */
    keysExcluded?: (keyof T)[],
    /**
     * default: false
     */
    strict?: boolean,
};

export function expectProperties<T extends ObjectLiteral = ObjectLiteral>(
    properties: T,
    raw: Record<string, any>,
    options: ExpectPropertiesOptions<T> = {},
) {
    const keys = Object.keys(properties);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (options.keysExcluded) {
            const index = options.keysExcluded.indexOf(key);
            if (index !== -1) {
                continue;
            }
        }

        if (!options.strict && !hasOwnProperty(raw, key)) {
            continue;
        }

        expect(raw[key]).toEqual(properties[key]);
    }
}
