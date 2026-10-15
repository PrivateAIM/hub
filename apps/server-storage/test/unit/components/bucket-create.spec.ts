/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { BucketCommand, BucketEvent } from '@privateaim/server-storage-kit';
import { describe, expect, it } from 'vitest';
import { BucketCreateHandler } from '../../../src/app/components/bucket/handlers/create/module.ts';
import { FakeStorageAdapter } from '../core/entities/bucket/fake-storage.ts';

describe('components/bucket/create', () => {
    it('should echo the command ref fields on CREATION_FAILED', async () => {
        const handler = new BucketCreateHandler({ storage: new FakeStorageAdapter() });
        const events: [string, unknown][] = [];
        const refId = faker.string.uuid();

        await handler.handle({
            name: `analysis-code-files.${refId}`,
            realmId: 'not-a-uuid',
            refType: 'analysis',
            refId,
        }, {
            key: BucketCommand.CREATE,
            metadata: {},
            handle: async (...input) => {
                events.push([input[0], input[1]]);
            },
        });

        const failed = events.find(([key]) => key === BucketEvent.CREATION_FAILED);
        expect(failed?.[1]).toMatchObject({
            refType: 'analysis',
            refId,
            name: `analysis-code-files.${refId}`,
        });
    });
});
