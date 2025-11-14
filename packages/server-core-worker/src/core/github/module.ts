/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '@privateaim/kit';
import { Client } from 'hapic';
import type { RequestBaseOptions } from 'hapic';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { extract } from 'tar';
import type {
    GitHubRepositoryBranch,
    GitHubRepositoryBranches,
    GitHubRepositoryCloneOptions,
    GitHubRepositoryTarballOptions,
} from './types';

export class GitHubClient extends Client {
    constructor(options: RequestBaseOptions = {}) {
        options.baseURL = options.baseURL || 'https://api.github.com/';

        super(options);
    }

    async getRepositoryBranch(owner: string, repo: string, branch: string): Promise<GitHubRepositoryBranch> {
        const response = await this.get(`repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Accept: 'application/vnd.github+json',
            },
            responseType: 'json',
        });

        return response.data;
    }

    async getRepositoryBranches(owner: string, repo: string): Promise<GitHubRepositoryBranches> {
        const response = await this.get(`repos/${owner}/${repo}/branches`, {
            headers: {
                Accept: 'application/vnd.github+json',
            },
            responseType: 'json',
        });

        return response.data;
    }

    async getRepositoryTarball(options: GitHubRepositoryTarballOptions): Promise<ReadableStream<any>> {
        const response = await this.get(
            `repos/${options.owner}/${options.repository}/tarball/${options.branch}`,
            {
                responseType: 'stream',
            },
        );

        return response.data;
    }

    async cloneRepository(options: GitHubRepositoryCloneOptions) : Promise<string> {
        const tmpFilePath = path.join(tmpdir(), `${createNanoID()}.tar.gz`);

        await fs.promises.rm(options.destination, { force: true, recursive: true });
        await fs.promises.mkdir(options.destination, { recursive: true });

        const stream = await this.getRepositoryTarball(options);

        const writable = fs.createWriteStream(tmpFilePath);

        return new Promise<string>((resolve, reject) => {
            writable.on('error', (err) => {
                reject(err);
            });

            writable.on('finish', () => {
                Promise.resolve()
                    .then(() => extract({
                        file: tmpFilePath,
                        cwd: options.destination,
                        onReadEntry(entry) {
                            entry.path = entry.path.split('/').splice(1).join('/');
                        },
                    }))
                    .then(() => fs.promises.rm(tmpFilePath))
                    .then(() => resolve(options.destination))
                    .catch((e) => reject(e));
            });

            const readStream = Readable.fromWeb(stream as any);
            readStream.pipe(writable);
        });
    }
}
