/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import zod from 'zod';
import { LogChannel, LogLevel } from './constants';
import type { LogInput } from './entity';

export class LogValidator extends Container<LogInput> {
    protected initialize() {
        super.initialize();

        this.mount(
            'time',
            { optional: true },
            createValidator(
                zod
                    .iso
                    .datetime()
                    .optional(),
            ),
        );

        this.mount(
            'message',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(4096),
            ),
        );

        this.mount(
            'service',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(64),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'level',
            createValidator(
                zod
                    .enum(Object.values(LogLevel)),
            ),
        );

        this.mount(
            'channel',
            createValidator(
                zod
                    .enum(Object.values(LogChannel)),
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
