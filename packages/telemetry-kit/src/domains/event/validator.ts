/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import zod from 'zod';
import type { Event } from './entity';

export class EventValidator extends Container<Event> {
    protected initialize() {
        super.initialize();

        this.mount(
            'ref_type',
            createValidator(
                zod
                    .string()
                    .min(3)
                    .max(128),
            ),
        );

        this.mount(
            'ref_id',
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
            'request_path',
            { optional: true },
            createValidator(zod.string().min(3).max(256).nullable()),
        );

        this.mount(
            'request_method',
            { optional: true },
            createValidator(zod.string().min(3).max(10).nullable()),
        );

        this.mount(
            'request_ip_address',
            { optional: true },
            createValidator(zod.ipv4().nullable()),
        );

        this.mount(
            'request_user_agent',
            { optional: true },
            createValidator(zod.string().min(3).max(512).nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'actor_type',
            { optional: true },
            createValidator(zod.string().min(3).max(64).nullable()),
        );

        this.mount(
            'actor_id',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        this.mount(
            'actor_name',
            { optional: true },
            createValidator(zod.string().min(3).max(64).nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'realm_id',
            { optional: true },
            createValidator(zod.uuidv4().nullable()),
        );

        // ----------------------------------------------

        this.mount(
            'expires_at',
            { optional: true },
            createValidator(
                zod.iso.datetime()
                    .nullable(),
            ),
        );
    }
}
