/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'docken';
import { pushImage } from 'docken';
import type { AuthConfig, Image } from 'dockerode';

export async function pushDockerImage(
    docker: Client,
    input: Image | string,
    authConfig: AuthConfig,
) {
    const image = typeof input === 'string' ? docker.getImage(input) : input;

    await pushImage(docker, image, { authconfig: authConfig });

    await image.remove({ force: true });
}
