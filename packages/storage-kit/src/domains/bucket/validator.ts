/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createValidator } from '@validup/zod';
import zod from 'zod';
import { BadRequestError } from '@privateaim/errors';
import type { Bucket } from './entity.ts';
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';

export class BucketValidator extends TypedContainer<Partial<Bucket>> {
    protected override initialize() {
        super.initialize();

        this.mount(
            'name',
            { group: ValidatorGroup.CREATE },
            createValidator(
                zod.string()
                    .min(3)
                    .max(256),
            ),
        );

        this.mount(
            'region',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .min(3)
                    .max(256)
                    .nullable(),
            ),
        );

        this.mount(
            'realmId',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .uuid()
                    .nullable(),
            ),
        );

        // Ref fields are create-time only, like region/realmId above — a
        // bucket's owning resource isn't reassignable through the update
        // route.
        this.mount(
            'refType',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .min(1)
                    .max(64)
                    .nullable(),
            ),
        );

        this.mount(
            'refId',
            { group: ValidatorGroup.CREATE, optional: true },
            createValidator(
                zod.string()
                    .uuid()
                    .nullable(),
            ),
        );
    }
}

/**
 * refType names the kind of the owning resource, refId a specific
 * instance of it. refType alone is valid — categorizing a bucket by kind
 * without pointing at one instance — but refId alone is NOT: an id with no
 * named type can't be resolved back to anything. So the rule is one-way:
 * refId requires refType, not the reverse.
 *
 * Checked here, against the ALREADY-VALIDATED payload, rather than as a
 * cross-field check inside the `refId` mount above: it is an `optional:
 * true` CREATE-group mount, and validup skips an optional mount entirely
 * when its own key is absent from the input, so a check embedded in it
 * would never run for the "refId omitted, refType sent alone" case — which
 * this function must treat as VALID, not reject.
 *
 * Both create-time producers call this once, right after
 * `validator.run()`: `BucketService.create()` (HTTP) and
 * `BucketCreateHandler.process()` (AMQP, server-storage-kit).
 */
export function assertBucketRefPairing(data: Partial<Bucket>): void {
    if (data.refId && !data.refType) {
        throw new BadRequestError('refId requires refType to be set as well.');
    }
}
