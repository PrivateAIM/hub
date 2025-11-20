/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@privateaim/core-kit';
import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentData, ComponentMetadata } from '@privateaim/server-kit';
import type { RegistryCommand } from './constants';

export type RegistrySetupPayload = {
    id: Registry['id']
};

export type RegistryCleanupPayload = {
    id: Registry['id']
};

export type RegistryProjectLinkPayload = {
    id: RegistryProject['id'],
    secret?: string
};

export type RegistryProjectUnlinkPayload = {
    id?: RegistryProject['id'],
    registryId: Registry['id'],
    externalName: RegistryProject['external_name'],
    accountId?: RegistryProject['account_id']
};

export type RegistryProjectRelinkPayload = RegistryProjectUnlinkPayload & {
    id: RegistryProject['id']
};

export type RegistryEventMap = ObjectLiteralKeys<{
    [RegistryCommand.SETUP]: [RegistrySetupPayload, ComponentMetadata],
    [RegistryCommand.HOOK_PROCESS]: [ComponentData, ComponentMetadata],
    [RegistryCommand.DELETE]: [RegistrySetupPayload, ComponentMetadata],
    [RegistryCommand.CLEANUP]: [RegistryCleanupPayload, ComponentMetadata],
    [RegistryCommand.PROJECT_LINK]: [RegistryProjectLinkPayload, ComponentMetadata],
    [RegistryCommand.PROJECT_UNLINK]: [RegistryProjectUnlinkPayload, ComponentMetadata],
    [RegistryCommand.PROJECT_RELINK]: [RegistryProjectRelinkPayload, ComponentMetadata],
}>;
