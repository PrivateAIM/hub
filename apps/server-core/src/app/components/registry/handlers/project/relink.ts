/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, EntityConflictError } from '@privateaim/errors';
import type { ComponentHandler } from 'hubwire';
import type { RegistryEventMap, RegistryProjectRelinkPayload } from '../../types.ts';
import type { RegistryCommand } from '../../../../../core/domains/index.ts';
import type { RegistryProjectRelinkContext } from './relink/types.ts';

export class RegistryProjectRelinkHandler implements ComponentHandler<
    RegistryEventMap,
    RegistryCommand.PROJECT_RELINK
> {
    constructor(private readonly context: RegistryProjectRelinkContext) {}

    async handle(value: RegistryProjectRelinkPayload): Promise<void> {
        // Old queued commands have no target. Never reinterpret them as unlink/link.
        if (!value || typeof value.id !== 'string' || !value.id ||
            typeof value.registryId !== 'string' || !value.registryId ||
            typeof value.externalName !== 'string' || !value.externalName ||
            !('targetExternalName' in value) || typeof value.targetExternalName !== 'string' ||
            !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(value.targetExternalName) ||
            value.targetExternalName.length > 64 || value.targetExternalName === value.externalName) {
            throw new BadRequestError('A relink requires an explicit, distinct target registry project name.');
        }

        const targetName = value.targetExternalName;
        const { store, migration } = this.context;

        await store.withLock(value.registryId, async () => {
            const source = await store.load(value.id);

            if (!source || source.project.registryId !== value.registryId) {
                throw new EntityConflictError('The registry project binding changed before relink.');
            }

            // An acknowledged cutover is idempotent even after a worker crash.
            if (source.project.externalName === targetName) {
                return;
            }

            if (source.project.externalName !== value.externalName || !source.project.externalId ||
                (value.accountId !== undefined && value.accountId !== source.project.accountId)) {
                throw new EntityConflictError('The relink source no longer matches the registry project.');
            }

            await store.assertIdle(source);
            await store.assertTargetAvailable(source, targetName);

            const target = await migration.prepare(source, targetName);

            await migration.copy(source, target);
            await migration.configureWebhook(source, target);
            // This rechecks the original binding inside a short row-lock transaction.
            await store.cutover(source, target);
        });
    }
}
