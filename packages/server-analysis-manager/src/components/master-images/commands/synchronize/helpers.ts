/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { extract } from 'tar';

type GitRepositorySaveOptions = {
    destination: string,
    url: string,
    branch: string
};
export async function saveGitRepository(options: GitRepositorySaveOptions) {
    const tmpFilePath = path.join(tmpdir(), 'master-images.tar.gz');

    await fs.promises.rm(options.destination, { force: true, recursive: true });
    await fs.promises.mkdir(options.destination, { recursive: true });

    const client = createClient();

    // todo: add branch + repo option
    const response = await client.get(
        new URL(`archive/${options.branch}.tar.gz`, options.url).href,
        {
            responseType: 'stream',
        },
    );

    const writable = fs.createWriteStream(tmpFilePath);

    return new Promise<void>((resolve, reject) => {
        writable.on('error', (err) => {
            reject(err);
        });

        writable.on('finish', async () => {
            await extract({
                file: tmpFilePath,
                cwd: options.destination,
                onReadEntry(entry) {
                    entry.path = entry.path.split('/').splice(1).join('/');
                },
            });

            resolve();
        });

        const readStream = Readable.fromWeb(response.data as any);
        readStream.pipe(writable);
    });
}
