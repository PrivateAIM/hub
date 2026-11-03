/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@privateaim/core-kit';

export type RegistryProjectMigrationMarker = {
    kind: 'privateaim-registry-project-migration';
    version: 1;
    registryId: string;
    registryProjectId: string;
    sourceExternalName: string;
    sourceExternalId: string;
    targetExternalName: string;
    targetExternalId: string;
};

export type RegistryProjectRelinkSource = {
    project: RegistryProject;
    registry: Registry;
};

export type RegistryProjectRelinkTarget = Pick<RegistryProject, 'externalName' | 'externalId' | 'accountId' | 'accountName' | 'accountSecret'>;

/** A durable project binding, not the user-facing node/project name. */
export interface IRegistryProjectRelinkStore {
    withLock<T>(registryId: string, fn: () => Promise<T>): Promise<T>;
    load(id: string): Promise<RegistryProjectRelinkSource | null>;
    assertIdle(source: RegistryProjectRelinkSource): Promise<void>;
    assertTargetAvailable(source: RegistryProjectRelinkSource, targetName: string): Promise<void>;
    cutover(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void>;
}

/** The remote migration owns its destination, and never deletes the source. */
export interface IRegistryProjectMigration {
    prepare(source: RegistryProjectRelinkSource, targetName: string): Promise<RegistryProjectRelinkTarget>;
    copy(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void>;
    configureWebhook(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void>;
}

export type RegistryProjectRelinkContext = {
    store: IRegistryProjectRelinkStore;
    migration: IRegistryProjectMigration;
};

