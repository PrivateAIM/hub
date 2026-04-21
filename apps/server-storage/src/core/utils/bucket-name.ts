/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function toBucketName(input: string) : string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '')
        .slice(0, 63)
        .replace(/[^a-z0-9]+$/g, '');
}
