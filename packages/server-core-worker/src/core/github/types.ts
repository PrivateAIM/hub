/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type GitHubRepositoryBranch = {
    name: string,
    commit: {
        sha: string,
        url: string
    },
    protected: boolean
};

export type GitHubRepositoryBranches = GitHubRepositoryBranch[];

export type GitHubRepositoryTarballOptions = {
    owner: string,
    repository: string,
    branch: string,
};

export type GitHubRepositoryCloneOptions = GitHubRepositoryTarballOptions & {
    destination: string
};
