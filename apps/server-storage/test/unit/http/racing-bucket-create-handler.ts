/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BucketCreateHandler } from '../../../src/app/components/bucket/handlers/create/index.ts';

/**
 * Misses the existing bucket on its first lookup, like a concurrent create
 * whose existence check ran before the other one saved.
 */
export class RacingBucketCreateHandler extends BucketCreateHandler {
    protected missed = false;

    protected override async findExisting(...input: Parameters<BucketCreateHandler['findExisting']>) {
        if (!this.missed) {
            this.missed = true;

            return null;
        }

        return super.findExisting(...input);
    }
}
