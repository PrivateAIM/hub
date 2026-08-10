/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatByteSize(input: number) : string {
    if (!Number.isFinite(input) || input < 0) {
        return '';
    }

    let value = input;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit++;
    }

    const rounded = value >= 10 || unit === 0 ?
        `${Math.round(value)}` :
        value.toFixed(1);

    return `${rounded} ${UNITS[unit]}`;
}
