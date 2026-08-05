/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import zod from 'zod';
import { LogLevel } from '@privateaim/telemetry-kit';
import { TypedContainer } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import type { AnalysisNodeLog } from './entity.ts';

export class AnalysisNodeLogValidator extends TypedContainer<AnalysisNodeLog> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'nodeId',
            createValidator(
                zod
                    .uuidv4(),
            ),
        );

        this.mount(
            'analysisId',
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
                    .enum(LogLevel),
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
