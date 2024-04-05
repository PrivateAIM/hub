/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { createLogger } from '@privateaim/server-kit';
import { getWritableDirPath } from '../../../config';
import { ComponentName } from '../../constants';

let instance : Logger | undefined;

export function useBuilderLogger() : Logger {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = createLogger({
        options: {
            defaultMeta: {
                component: ComponentName.BUILDER,
            },
        },
        // todo: allow customizing specific path
        directory: getWritableDirPath(),
    });

    return instance;
}
