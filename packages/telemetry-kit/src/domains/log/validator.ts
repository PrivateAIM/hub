/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import zod from 'zod';
import { LogLevel } from './constants';
import type { Log } from './entity';

export class LogValidator extends Container<Log> {
    protected initialize() {
        super.initialize();

        this.mount(
            'time',
            { optional: true },
            createValidator(
                zod
                    .string()
                    .min(10)
                    .max(12)
                    .or(zod.bigint())
                    .optional(),
            ),
        );

        this.mount(
            'message',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(512),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'level',
            { optional: true },
            createValidator(
                zod
                    .enum(Object.values(LogLevel))
                    .optional(),
            ),
        );

        this.mount(
            'labels',
            { optional: true },
            createValidator(
                zod
                    .record(zod.string(), zod.string())
                    .nullable(),
            ),
        );
    }
}
