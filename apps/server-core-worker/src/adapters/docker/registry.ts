/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getHostNameFromString } from '@privateaim/kit';

type DockerImageURLBuildContext = {
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string,

    hostname?: string
};

export function buildDockerImageURL(context: DockerImageURLBuildContext): string {
    const parts : string[] = [];
    if (context.hostname) {
        parts.push(getHostNameFromString(context.hostname));
    }
    parts.push(...[

        context.projectName,
        context.repositoryName,
    ]);

    let basePath = parts.join('/');

    if (context.tagOrDigest) {
        basePath += context.tagOrDigest.startsWith('sha') ?
            `@${context.tagOrDigest}` :
            `:${context.tagOrDigest}`;
    }

    return basePath;
}
