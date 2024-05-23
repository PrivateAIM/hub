/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import type { ComponentErrorOptions } from '@privateaim/server-kit';
import { BaseError } from '../error';

export class CoreError extends BaseError {
    constructor(options: Omit<ComponentErrorOptions, 'component'>) {
        super({
            ...options,
            component: ComponentName.CORE,
        });
    }
}
