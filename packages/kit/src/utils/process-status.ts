/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '../constants.ts';

export const ProcessStatusRank: Record<`${ProcessStatus}`, number> = {
    [ProcessStatus.FAILED]: -1,
    [ProcessStatus.STARTING]: 0,
    [ProcessStatus.STARTED]: 1,
    [ProcessStatus.STOPPING]: 2,
    [ProcessStatus.STOPPED]: 3,
    [ProcessStatus.EXECUTING]: 4,
    [ProcessStatus.EXECUTED]: 5,
};

export function getMinProcessStatus(
    statuses: (`${ProcessStatus}` | null)[],
): `${ProcessStatus}` | null {
    let minRank: number | null = null;
    let minStatus: `${ProcessStatus}` | null = null;

    for (const status of statuses) {
        if (!status) {
            continue;
        }

        const rank = ProcessStatusRank[status];
        if (rank === -1) {
            return ProcessStatus.FAILED;
        }

        if (minRank === null || rank < minRank) {
            minRank = rank;
            minStatus = status;
        }
    }

    return minStatus;
}
