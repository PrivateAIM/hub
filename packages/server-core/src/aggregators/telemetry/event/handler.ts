/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { EventComponentEventMap, EventCreationFinishedEventPayload, EventEvent } from '@privateaim/server-telemetry-kit';
import { AnalysisBucketType, DomainType as CoreDomainType } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { DomainEventName } from '@privateaim/kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { DomainType } from '@privateaim/storage-kit';
import { AnalysisBucketEntity, AnalysisBucketFileEntity, AnalysisNodeEventEntity } from '../../../database';

export class TelemetryEventCreatorFinishedHandler implements ComponentHandler<
EventComponentEventMap,
EventEvent.CREATION_FINISHED
> {
    async handle(value: EventCreationFinishedEventPayload): Promise<void> {
        switch (value.ref_type) {
            case CoreDomainType.ANALYSIS_NODE: {
                await this.processAnalysisNode(value);
                break;
            }
            case DomainType.BUCKET_FILE: {
                await this.processBucketFile(value);
            }
        }
    }

    protected async processAnalysisNode(value: EventCreationFinishedEventPayload) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(AnalysisNodeEventEntity);

        switch (value.name) {
            case DomainEventName.CREATED: {
                const entity = repository.create({
                    event_id: value.id,
                    node_id: value.data.node_id,
                    node_realm_id: value.data.node_realm_id,
                    analysis_id: value.data.analysis_id,
                    analysis_realm_id: value.data.analysis_realm_id,
                });

                await repository.save(entity);

                useLogger().debug(`Creating analysis-node-event entity ${entity.id}`);
                break;
            }
            case DomainEventName.DELETED: {
                const entity = await repository.findOneBy({
                    node_id: value.data.node_id,
                    analysis_id: value.data.analysis_id,
                });

                if (entity) {
                    const { id } = entity;
                    await repository.remove(entity);

                    useLogger().debug(`Removing analysis-node-event entity ${id}`);
                }
            }
        }
    }

    protected async processBucketFile(
        value: EventCreationFinishedEventPayload,
    ) {
        const data = value.data as BucketFile;

        const dataSource = await useDataSource();
        const analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);

        const analysisBucket = await analysisBucketRepository.findOne({
            where: {
                bucket_id: data.bucket_id,
            },
            relations: {
                analysis: true,
            },
        });

        if (!analysisBucket) {
            useLogger().debug(`No analysis bucket found for bucket ${data.bucket_id}`);
            return;
        }

        if (
            analysisBucket.type === AnalysisBucketType.CODE &&
            analysisBucket.analysis.configuration_locked
        ) {
            useLogger().debug(`Analysis ${analysisBucket.analysis.id} is locked. No files can be assigned/unassigned`);
            return;
        }

        const analysisBucketFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);

        switch (value.name) {
            case DomainEventName.CREATED: {
                const analysisBucketFile = analysisBucketFileRepository.create({
                    name: data.path,
                    analysis_bucket_id: analysisBucket.id,
                    analysis_id: analysisBucket.analysis_id,
                    realm_id: analysisBucket.realm_id,
                    bucket_file_id: data.id,
                });

                switch (data.actor_type) {
                    case 'user': {
                        analysisBucketFile.user_id = data.actor_id;
                        break;
                    }
                    case 'robot': {
                        analysisBucketFile.robot_id = data.actor_id;
                        break;
                    }
                }

                useLogger().debug(`Assigned analysis bucket file ${analysisBucketFile.name}`);
                break;
            }
            case DomainEventName.DELETED: {
                const analysisBucketFile = await analysisBucketFileRepository.findOneBy({
                    bucket_file_id: data.id,
                });

                if (analysisBucketFile) {
                    await analysisBucketFileRepository.remove(analysisBucketFile);

                    useLogger().debug(`Removed analysis bucket file ${analysisBucketFile.name}`);
                }
                break;
            }
        }
    }
}
