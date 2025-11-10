/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentEmitter } from './types';

export class ComponentVoidEmitter implements ComponentEmitter {
    emit(): Promise<void> | void {
        // todo: do nothing
    }
}
