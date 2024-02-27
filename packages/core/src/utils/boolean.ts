/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function isBoolTrue<T = any>(input: T | boolean) : input is true {
    return typeof input === 'boolean' && !!input;
}

export function isBoolFalse<T = any>(input: T | boolean) : input is false {
    return typeof input === 'boolean' && !input;
}

export function isBool<T = any>(input: T | boolean) : input is boolean {
    return typeof input === 'boolean';
}
