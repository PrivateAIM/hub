/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export function nanoSeconds() : bigint {
    return BigInt(
        Math.floor(performance.timeOrigin),
    ) * 1_000_000n + BigInt(
        Math.floor(performance.now() * 1_000_000),
    );
}
