/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainType } from './constants';
import type { Event } from './event';

type DomainTypeMapRaw = {
    [DomainType.EVENT]: Event,
};

export type DomainTypeMap = {
    [K in keyof DomainTypeMapRaw as `${K}`]: DomainTypeMapRaw[K]
};
