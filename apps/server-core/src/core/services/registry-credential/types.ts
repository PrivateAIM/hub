/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@privateaim/core-kit';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * The registry coordinates a node needs to authenticate against its own
 * docker registry project (Harbor robot account): the registry host plus
 * account credentials, projected from {@link Registry}, and the project
 * namespace (`external_name`), which only lives on {@link RegistryProject}.
 */
export type RegistryCredentials =    & Pick<Registry, 'host' | 'account_name' | 'account_secret'> &
    Pick<RegistryProject, 'external_name'>;

export interface INodeRegistryCredentialService {
    getCredentials(nodeId: string, actor: ActorContext): Promise<RegistryCredentials>;
}
