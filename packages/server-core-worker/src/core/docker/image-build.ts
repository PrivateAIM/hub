/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { waitForStream } from 'docken';
import type { ImageBuildOptions } from 'dockerode';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import { useDocker } from './instance';

export async function buildDockerImage(
    content: string,
    options: ImageBuildOptions,
) {
    const pack = tar.pack();
    const entry = pack.entry({
        name: 'Dockerfile',
        type: 'file',
        size: content.length,
    }, (err) => {
        if (err) {
            pack.destroy(err);
        }

        pack.finalize();
    });

    entry.write(content);
    entry.end();

    const client = useDocker();
    const stream = await client
        .buildImage(pack.pipe(createGzip()), options);

    return waitForStream(client, stream);
}
