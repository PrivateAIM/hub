/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import { Container } from 'validup';
import zod from 'zod';
import type { Event } from './entity';

export class EventValidator extends Container<Event> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'refType',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(128),
            ),
        );

        this.mount(
            'refId',
            { optional: true },
            createValidator(
                zod
                    .uuidv4()
                    .nullable(),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'scope',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(128),
            ),
        );

        this.mount(
            'name',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(128),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'data',
            { optional: true },
            createValidator(
                zod
                    .record(zod.string(), zod.any())
                    .nullable(),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'expiring',
            { optional: true },
            createValidator(
                zod
                    .boolean()
                    .nullable(),
            ),
        );

        // ----------------------------------------------

        this.mount(
            'requestPath',
            { optional: true },
            createValidator(zod.string().min(3).max(256).nullable()),
        );

        this.mount(
            'requestMethod',
            { optional: true },
            createValidator(zod.string().min(3).max(10).nullable()),
        );

        this.mount(
            'requestIpAddress',
            { optional: true },
            createValidator(zod.ipv4().nullable()),
        );

        this.mount(
            'requestUserAgent',
            { optional: true },
            createValidator(zod.string().min(3).max(512).nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'actorType',
            { optional: true },
            createValidator(zod.string().min(3).max(64).nullable()),
        );

        this.mount(
            'actorId',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        this.mount(
            'actorName',
            { optional: true },
            createValidator(zod.string().min(3).max(64).nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'realmId',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'expiresAt',
            { optional: true },
            createValidator(
                zod.iso.datetime()
                    .nullable(),
            ),
        );
    }
}
