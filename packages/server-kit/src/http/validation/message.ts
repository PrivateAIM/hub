/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function buildHTTPValidationErrorMessage<
    T extends Record<string, any> = Record<string, any>,
>(name: keyof T | (keyof T)[]) {
    const names = Array.isArray(name) ? name : [name];

    if (names.length > 1) {
        return `The parameters ${names.join(', ')} is invalid.`;
    }
    return `The parameter ${String(names[0])} is invalid.`;
}
