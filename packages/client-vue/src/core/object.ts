/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function extendObjectProperties<T extends Record<string, any>>(
    src: T,
    input?: Partial<T>,
) : T {
    if (!input) {
        return src;
    }

    const keys : (keyof T)[] = Object.keys(input);
    for (const key of keys) {
        src[key] = input[key] as T[keyof T];
    }

    return src;
}
