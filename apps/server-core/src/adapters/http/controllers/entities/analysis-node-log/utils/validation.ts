/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import zod from 'zod';
import { LogLevel } from '@privateaim/telemetry-kit';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import type { AnalysisNodeLog } from '@privateaim/core-kit';

export class AnalysisNodeLogValidator extends Container<AnalysisNodeLog> {
    protected initialize() {
        super.initialize();

        this.mount(
            'node_id',
            createValidator(
                zod
                    .uuidv4(),
            ),
        );

        this.mount(
            'analysis_id',
            createValidator(
                zod
                    .uuidv4(),
            ),
        );

        this.mount(
            'status',
            { optional: true },
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(64)
                    .optional()
                    .nullable(),
            ),
        );

        this.mount(
            'message',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(2048),
            ),
        );

        this.mount(
            'code',
            { optional: true },
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(64)
                    .optional()
                    .nullable(),
            ),
        );

        this.mount(
            'level',
            createValidator(
                zod
                    .enum(Object.values(LogLevel)),
            ),
        );

        this.mount(
            'labels',
            { optional: true },
            createValidator(
                zod
                    .record(zod.string(), zod.string()),
            ),
        );
    }
}
