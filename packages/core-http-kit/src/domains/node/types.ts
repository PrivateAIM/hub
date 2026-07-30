/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@authup/core-kit';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import type { EntityRecordResponse, IEntityAPI } from '../types-base';

export type NodeCreatePayload =    & Pick<Node, 'name'> &
    Partial<Pick<Node, 'type' | 'hidden' | 'publicKey' | 'externalName' | 'registryId' | 'clientId' | 'realmId'>>;

export type NodeUpdatePayload = Partial<NodeCreatePayload>;

export type NodeClientCredentials = {
    id: Client['id'];
    name: Client['name'];
    displayName: Client['displayName'];
    secret: Client['secret'];
};

export type NodeClientCredentialsUpdate = Partial<{
    secret: Client['secret'];
    name: Client['name'];
    displayName: Client['displayName'];
}>;

export type NodeRegistryCredentials =    & Pick<Registry, 'host' | 'accountName' | 'accountSecret'> &
    Pick<RegistryProject, 'externalName'>;

export interface INodeAPI extends IEntityAPI<Node, NodeCreatePayload, NodeUpdatePayload> {
    runCommand(id: Node['id'], task: string, data: Record<string, any>) : Promise<EntityRecordResponse<Node>>;

    getClientCredentials(id: Node['id']) : Promise<NodeClientCredentials>;
    setClientCredentials(id: Node['id'], data?: NodeClientCredentialsUpdate) : Promise<NodeClientCredentials>;
    getRegistryCredentials(id: Node['id']) : Promise<NodeRegistryCredentials>;
}
