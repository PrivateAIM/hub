/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../type';

export interface ComponentEmitter {
    emit(
        type: string,
        data?: ObjectLiteral,
        metadata?: ObjectLiteral
    ) : Promise<void> | void;
}

// todo: metadata should contain { target: { service: 'xxx', component: 'xxx }
