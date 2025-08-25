/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DockerAuthConfig = {
    username: string,
    password: string,
    serveraddress: string
};

// -------------------------------------------------------

export type DockerContainerFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type DockerContainerFile = {
    name: string,
    path?: string,
    type: DockerContainerFileType,
    size: number,
    content: string
};

export type DockerConnectionOptions = {
    host: string,
    user: string,
    password: string
};
