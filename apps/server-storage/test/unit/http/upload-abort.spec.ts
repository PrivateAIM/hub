/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { BucketEntity } from '../../../src/adapters/database/index.ts';
import { uploadRequestFilesToBucket } from '../../../src/adapters/http/controllers/bucket/upload.ts';
import { BucketFileComponent } from '../../../src/app/components/bucket-file/index.ts';
import { FakeStorageAdapter } from '../core/entities/bucket/fake-storage.ts';

const BOUNDARY = 'hub-boundary';

/**
 * A multipart body whose connection drops in the middle of a file, as a
 * client aborting its upload looks to the server.
 */
function createAbortedBody(): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode([
                `--${BOUNDARY}`,
                'Content-Disposition: form-data; name="file"; filename="result.json"',
                'Content-Type: application/json',
                '',
                '{"partial":',
            ].join('\r\n')));

            setTimeout(() => controller.error(new Error('aborted')), 20);
        },
    });
}

describe('uploadRequestFilesToBucket', () => {
    it('fails instead of hanging when the client aborts mid-file', async () => {
        const bucket = new BucketEntity();

        bucket.id = randomUUID();
        bucket.name = 'upload-abort';
        bucket.realmId = randomUUID();

        const component = new BucketFileComponent({ storage: new FakeStorageAdapter() });

        await component.start();

        const app = new App();

        app.post('/', defineCoreHandler(async (event) => uploadRequestFilesToBucket(
            event,
            bucket,
            {
                type: 'user', 
                id: randomUUID(), 
                realmId: bucket.realmId, 
            },
            component,
        )));

        // `duplex` is required for a stream body but missing from the DOM lib.
        const init: RequestInit & { duplex: 'half' } = {
            method: 'POST',
            headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
            body: createAbortedBody(),
            duplex: 'half',
        };
        const response = await app.fetch(new Request('http://storage.test/', init));

        expect(response.status).toBeGreaterThanOrEqual(400);
    }, 3000);
});
