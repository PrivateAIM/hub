/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@privateaim/core';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createClient } from 'hapic';
import tar from 'tar';
import { scanDirectory } from 'docker-scan';
import { getWritableDirPath, useEnv } from '../../../config';
import type { ReturnContext } from './utils';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

type MasterImagesSyncresponse = {
    images: ReturnContext<MasterImage>,
    groups: ReturnContext<MasterImageGroup>
};

export async function syncMasterImages() : Promise<MasterImagesSyncresponse> {
    const directoryPath: string = path.join(getWritableDirPath(), 'master-images');

    await fs.promises.rm(directoryPath, { force: true, recursive: true });
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const client = createClient();
    const response = await client.get(
        new URL('archive/master.tar.gz', useEnv('masterImagesURL')).href,
        {
            responseType: 'stream',
        },
    );

    const tarPath = path.join(getWritableDirPath(), 'master-images.tar.gz');
    const writable = fs.createWriteStream(tarPath);

    return new Promise((resolve, reject) => {
        writable.on('error', (err) => {
            reject(err);
        });

        writable.on('finish', async () => {
            await tar.extract({
                file: tarPath,
                cwd: directoryPath,
                onentry(entry) {
                    entry.path = entry.path.split('/').splice(1).join('/');
                },
            });

            const data = await scanDirectory(directoryPath);

            // languages
            const groups = await mergeMasterImageGroupsWithDatabase(data.groups);

            // images
            const images = await mergeMasterImagesWithDatabase(data.images);

            resolve({
                groups,
                images,
            });
        });

        const readStream = Readable.fromWeb(response.data as any);
        readStream.pipe(writable);
    });
}
