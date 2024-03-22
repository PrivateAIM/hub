/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ActionCommandElementType } from './constants';

export type ActionCommandProperties = {
    elementType: `${ActionCommandElementType}`,
    withIcon: boolean,
    withText: boolean
};
