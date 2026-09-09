/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Readable } from 'node:stream';
import type { DockerContainerPackTarget } from '../../../src/adapters/docker/index.ts';

export type FakeContainerPackCall = {
    path: string
};

/**
 * Stands in for dockerode's Container.
 *
 * `putArchive` consumes the stream before settling, like the real one: it
 * uploads the tar as the request body, so it neither resolves early nor hides
 * a mid-stream failure. A fake that resolved immediately would let every
 * pipeline error be reported as success.
 */
export class FakeContainerPackTarget implements DockerContainerPackTarget {
    public readonly calls : FakeContainerPackCall[] = [];

    protected buffered : Buffer | undefined;

    /**
     * Settles when the upload finishes or fails — i.e. when the real request
     * body would have been released.
     */
    public completion : Promise<unknown> | undefined;

    async putArchive(file: Readable, options: { path: string }): Promise<unknown> {
        this.calls.push({ path: options.path });

        this.completion = (async () => {
            const chunks : Buffer[] = [];
            for await (const chunk of file) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            this.buffered = Buffer.concat(chunks);
        })();

        return this.completion;
    }

    /**
     * The tar handed to `putArchive`, replayable as a stream.
     */
    archive(): Readable {
        if (typeof this.buffered === 'undefined') {
            throw new Error('putArchive has not been called.');
        }

        return Readable.from(this.buffered);
    }
}
