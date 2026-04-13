/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isPropertySet } from '@authup/kit';

export function nullifyEmptyObjectProperties<T extends Record<string, any>>(data: T) : T {
    const keys : (keyof T)[] = Object.keys(data);

    for (const key of keys) {
        if (data[key] === '') {
            data[key] = null as T[keyof T];
        }
    }

    return data;
}

export function deleteUndefinedObjectProperties<T extends Record<string, any>>(data: T) : T {
    const keys : string[] = Object.keys(data);

    for (const key of keys) {
        if (typeof data[key] === 'undefined') {
            delete data[key];
        }
    }

    return data;
}

export function extractObjectProperty<T extends Record<string, any>, K extends keyof T>(
    data: T | undefined,
    key: K,
) : T[K] | undefined {
    if (!data) {
        return undefined;
    }

    if (isPropertySet(data, key)) {
        return data[key];
    }

    return undefined;
}
