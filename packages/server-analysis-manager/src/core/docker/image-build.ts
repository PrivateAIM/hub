/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ImageBuildOptions } from 'dockerode';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import { useDocker } from './instance';
import { findErrorInDockerModemResponse } from './modem-response';
import type { DockerAuthConfig } from './type';

export async function buildDockerImage(
    context: {
        content: string,
        imageName: string,
        authConfig?: DockerAuthConfig
    },
) {
    const pack = tar.pack();
    const entry = pack.entry({
        name: 'Dockerfile',
        type: 'file',
        size: context.content.length,
    }, (err) => {
        if (err) {
            pack.destroy(err);
        }

        pack.finalize();
    });

    entry.write(context.content);
    entry.end();

    const options : ImageBuildOptions = {
        t: context.imageName
    };
    if(context.authConfig) {
        options.authconfig = context.authConfig;
    }

    const stream = await useDocker()
        .buildImage(pack.pipe(createGzip()), options);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream as any, (error: Error, output: any[]) => {
            error = error || findErrorInDockerModemResponse(output);
            if (error) {
                reject(error);
                return;
            }

            resolve(output);
        }, (e: any) => e);
    }));
}
