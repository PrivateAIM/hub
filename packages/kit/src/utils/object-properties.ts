/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function nullifyEmptyObjectProperties<T extends Record<string, any>>(data: T) : T {
    const keys : (keyof T)[] = Object.keys(data);

    for (const key of keys) {
        if (data[key] === '') {
            data[key] = null as T[keyof T];
        }
    }

    return data as T;
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
