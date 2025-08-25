/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, Registry } from '@privateaim/core-kit';

export type ComponentPayloadExtended<T extends Record<string, any>> = T & {
    entity: Analysis,

    registry: Registry
};
