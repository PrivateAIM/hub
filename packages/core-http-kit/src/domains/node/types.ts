/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@authup/core-kit';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';

export type NodeCreatePayload =    & Pick<Node, 'name'> &
    Partial<Pick<Node, 'type' | 'hidden' | 'public_key' | 'external_name' | 'registry_id' | 'client_id' | 'realm_id'>>;

export type NodeUpdatePayload = Partial<NodeCreatePayload>;

export type NodeClientCredentials = Pick<Client, 'id' | 'name' | 'display_name' | 'secret'>;

export type NodeClientCredentialsUpdate = Partial<Pick<Client, 'secret' | 'name' | 'display_name'>>;

export type NodeRegistryCredentials =    & Pick<Registry, 'host' | 'account_name' | 'account_secret'> &
    Pick<RegistryProject, 'external_name'>;
