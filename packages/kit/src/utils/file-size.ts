/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HumanFileSizeInput = number | bigint | string | null | undefined;

/**
 * Format a byte count for human-readable display.
 *
 * Accepts `number`, `bigint`, or a numeric `string` (e.g. a stringified
 * SQL `bigint` returned by some drivers/transports). `null` / `undefined` /
 * non-numeric input renders as an empty string.
 *
 * For sizes above `Number.MAX_SAFE_INTEGER` (~9 PB) the conversion to `number`
 * is lossy, but the resulting human-readable label is still accurate enough
 * for display purposes.
 */
export function humanFileSize(bytes: HumanFileSizeInput, si: boolean = false, dp: number = 1): string {
    if (bytes === null || typeof bytes === 'undefined') {
        return '';
    }

    let value: number;
    if (typeof bytes === 'number') {
        value = bytes;
    } else if (typeof bytes === 'bigint') {
        value = Number(bytes);
    } else {
        // Reject empty / whitespace-only strings — Number('') === 0, which we
        // don't want to render as "0 B" for what is effectively missing data.
        if (bytes.trim() === '') {
            return '';
        }
        value = Number(bytes);
    }

    if (!Number.isFinite(value)) {
        return '';
    }

    const thresh = si ? 1000 : 1024;

    if (Math.abs(value) < thresh) {
        return `${value} B`;
    }

    const units = si ?
        ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
        ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        value /= thresh;
        ++u;
    } while (Math.round(Math.abs(value) * r) / r >= thresh && u < units.length - 1);

    return `${value.toFixed(dp)} ${units[u]}`;
}
