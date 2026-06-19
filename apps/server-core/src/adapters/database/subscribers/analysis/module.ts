/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntityManager,
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { DomainType } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisEntity } from '../../entities/analysis.ts';
import type { AnalysisClientService } from '../../../../app/modules/database/analysis-client.ts';

export class AnalysisSubscriber extends BaseSubscriber<
    AnalysisEntity
> implements EntitySubscriberInterface<AnalysisEntity> {
    protected analysisClientService?: AnalysisClientService;

    constructor(ctx?: { analysisClientService?: AnalysisClientService }) {
        super({
            refType: DomainType.ANALYSIS,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.ANALYSIS,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.ANALYSIS, data.id],
                    });
                }

                return destinations;
            },
        });

        this.analysisClientService = ctx?.analysisClientService;
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        await super.afterInsert(event);

        await this.assignClient(event.entity, event.manager, true);
    }

    async afterUpdate(event: UpdateEvent<AnalysisEntity>): Promise<any> {
        await super.afterUpdate(event);

        await this.assignClient(
            {
                ...(event.databaseEntity || {}),
                ...event.entity,
            } as AnalysisEntity,
            event.manager,
            false,
        );
    }

    async afterRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        if (!this.analysisClientService) return;

        await this.analysisClientService.dismiss(event.entity || event.databaseEntity);
    }

    /**
     * Ensure the analysis owns an Authup client. On insert the default
     * self-capabilities are granted; on update we only (re)create a missing
     * client and never touch its permissions, so admin-configured capabilities
     * (plan 010, phase 2) are preserved.
     */
    protected async assignClient(
        entity: AnalysisEntity,
        manager: EntityManager,
        assignDefaultPermissions: boolean,
    ): Promise<void> {
        if (!this.analysisClientService) return;

        const prevId = entity.client_id;

        const client = await this.analysisClientService.assign(entity);
        if (client.id !== prevId) {
            const repository = manager.getRepository(AnalysisEntity);
            await repository.save(entity);
        }

        if (assignDefaultPermissions) {
            await this.analysisClientService.assignDefaultPermissions(client);
        }
    }

    listenTo() {
        return AnalysisEntity;
    }
}
