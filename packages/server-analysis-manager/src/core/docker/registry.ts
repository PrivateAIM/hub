/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getHostNameFromString } from '@privateaim/core';
import type { DockerAuthConfig, DockerConnectionOptions } from './type';

type RemoteDockerImageURLBuildContext = {
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string,

    hostname: string
};

export function buildRemoteDockerImageURL(context: RemoteDockerImageURLBuildContext): string {
    let basePath = [
        getHostNameFromString(context.hostname),
        context.projectName,
        context.repositoryName,
    ].join('/');

    if (context.tagOrDigest) {
        basePath += context.tagOrDigest.startsWith('sha') ?
            `@${context.tagOrDigest}` :
            `:${context.tagOrDigest}`;
    }

    return basePath;
}

export function buildDockerAuthConfig(config: DockerConnectionOptions) : DockerAuthConfig {
    return {
        username: config.user,
        password: config.password,
        serveraddress: getHostNameFromString(config.host),
    };
}
