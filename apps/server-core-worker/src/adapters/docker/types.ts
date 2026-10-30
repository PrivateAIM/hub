/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Header } from 'tar-stream';

/**
 * The slice of dockerode's Container this needs. Declared structurally so the
 * pack pipeline can be exercised without a docker daemon.
 */
export type DockerContainerPackTarget = {
    putArchive(file: Readable, options: { path: string }): Promise<unknown>;
};

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Partial<Header> & Pick<Header, 'name'>) => void,

    onEntryPackStarted?: (entry: Partial<Header> & Pick<Header, 'name'>) => void,
    onEntryPackFinished?: (entry: Partial<Header> & Pick<Header, 'name'>) => void,
    onEntryPackFailed?: (error: Error, entry: Partial<Header> & Pick<Header, 'name'>) => void,
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
