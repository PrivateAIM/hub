/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { waitForStream } from 'docken';
import type { AuthConfig, Image } from 'dockerode';
import { useDocker } from './instance';

export async function pushDockerImage(
    input: Image | string,
    authConfig: AuthConfig,
) {
    const docker = useDocker();

    let imageLatest : Image;
    if (typeof input === 'string') {
        imageLatest = docker.getImage(input);
    } else {
        imageLatest = input;
    }

    const stream = await imageLatest.push({
        authconfig: authConfig,
    });

    await waitForStream(docker, stream);

    await imageLatest.remove({
        force: true,
    });
}
