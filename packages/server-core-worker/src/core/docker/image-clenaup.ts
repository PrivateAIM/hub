/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'dockerode';
import { useDocker } from './instance';

export async function cleanupDockerImage(input: string | Image) : Promise<boolean> {
    const docker = useDocker();
    let image : Image;
    if (typeof input === 'string') {
        image = docker.getImage(input);
    } else {
        image = input;
    }

    try {
        await image.inspect();
        await image.remove({ force: true });
    } catch (e) {
        return false;
    }

    return true;
}

export async function cleanupDockerImages(input: (string | Image)[]) : Promise<boolean[]> {
    return Promise.all(input.map((el) => cleanupDockerImage(el)));
}
