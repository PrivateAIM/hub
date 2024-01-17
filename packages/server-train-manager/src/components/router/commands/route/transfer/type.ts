/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@personalhealthtrain/core';

export type TransferItem = {
    project: RegistryProject,
    repositoryName: string,
    artifactTag?: string,
};

export type TransferEcosystemItem = {
    repositoryName: string,
    artifactTag?: string,
};

export type TransferContext = {
    source: TransferItem,
    sourceRegistry?: Registry,
    destination?: TransferItem,
    destinationEcosystem?: TransferEcosystemItem,
    destinationRegistry?: Registry
};
