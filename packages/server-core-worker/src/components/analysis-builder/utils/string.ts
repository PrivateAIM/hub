/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function removeStringPrefix(input: string, prefix: string) {
    const substr = input.substring(0, prefix.length);
    if (substr === prefix) {
        return input.substring(prefix.length);
    }

    return input;
}
