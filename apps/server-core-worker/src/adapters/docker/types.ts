/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Headers } from 'tar-stream';

/**
 * The slice of dockerode's Container this needs. Declared structurally so the
 * pack pipeline can be exercised without a docker daemon.
 */
export type DockerContainerPackTarget = {
    putArchive(file: Readable, options: { path: string }): Promise<unknown>;
};

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Headers) => void,

    onEntryPackStarted?: (entry: Headers) => void,
    onEntryPackFinished?: (entry: Headers) => void,
    onEntryPackFailed?: (error: Error, entry: Headers) => void,
};

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
