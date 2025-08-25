/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import { getHostNameFromString } from '@privateaim/kit';
import type { AuthConfig } from 'dockerode';
import type { DockerAuthConfig, DockerConnectionOptions } from './type';

export function buildDockerAuthConfig(config: DockerConnectionOptions): DockerAuthConfig {
    return {
        username: config.user,
        password: config.password,
        serveraddress: getHostNameFromString(config.host),
    };
}

export function buildDockerAuthConfigFromRegistry(registry: Registry) : AuthConfig {
    return buildDockerAuthConfig({
        host: registry.host,
        user: registry.account_name,
        password: registry.account_secret,
    });
}
