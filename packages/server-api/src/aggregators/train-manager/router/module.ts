/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
    AnalysisContainerPath,
    AnalysisRunStatus,
    AnalysisNodeRunStatus,
} from '@personalhealthtrain/core';
import type { ComponentContextWithError } from '@personalhealthtrain/server-core';
import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/server-core';
import type { RouterEventContext } from '@personalhealthtrain/server-train-manager';
import {
    ComponentName,
    ExtractorCommand,
    RouterCommand,
    RouterEvent,
    buildExtractorQueuePayload,
    isRouterRoutePayload,
} from '@personalhealthtrain/server-train-manager';
import { publish } from 'amqp-extension';
import type { FindOptionsWhere } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { RegistryProjectEntity } from '../../../domains/registry-project/entity';
import { NodeEntity } from '../../../domains/node';
import { AnalysisEntity } from '../../../domains/analysis';
import type { AnalysisLogSaveContext } from '../../../domains/analysis-log';
import { saveAnalysisLog } from '../../../domains/analysis-log';
import { AnalysisNodeEntity } from '../../../domains/anaylsis-node/entity';

export async function handleTrainManagerRouterEvent(
    context: RouterEventContext | ComponentContextWithError<RouterEventContext>,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const where : FindOptionsWhere<AnalysisEntity> = {};

    if (
        isRouterRoutePayload(context.data)
    ) {
        if (context.data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
            return;
        }

        where.id = context.data.repositoryName;
    } else {
        where.id = context.data.id;
    }

    // -------------------------------------------------------------------------------

    const entity = await repository.findOneBy(where);
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    let trainLogContext : AnalysisLogSaveContext = {
        train: entity,
        component: ComponentName.ROUTER,
        command: context.command,
        event: context.event,
    };

    // -------------------------------------------------------------------------------

    switch (context.event) {
        case RouterEvent.POSITION_FOUND:
        case RouterEvent.ROUTED: {
            const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjectRepository.findOneBy({
                external_name: context.data.projectName,
            });

            if (!registryProject) {
                return;
            }

            switch (registryProject.type) {
                case RegistryProjectType.INCOMING: {
                    entity.run_status = AnalysisRunStatus.RUNNING;
                    trainLogContext.status = AnalysisRunStatus.RUNNING;

                    await repository.save(entity);
                    break;
                }
                case RegistryProjectType.OUTGOING: {
                    entity.run_status = AnalysisRunStatus.FINISHED;
                    trainLogContext.status = AnalysisRunStatus.FINISHED;

                    entity.outgoing_registry_project_id = registryProject.id;

                    await repository.save(entity);

                    if (context.event === RouterEvent.ROUTED) {
                        await publish(buildExtractorQueuePayload({
                            command: ExtractorCommand.EXTRACT,
                            data: {
                                id: entity.id,

                                filePaths: [
                                    AnalysisContainerPath.RESULTS,
                                    AnalysisContainerPath.CONFIG,
                                ],
                            },
                        }));
                    }
                    break;
                }
                case RegistryProjectType.STATION: {
                    entity.run_status = AnalysisRunStatus.RUNNING;
                    trainLogContext.status = AnalysisRunStatus.RUNNING;

                    const stationRepository = dataSource.getRepository(NodeEntity);
                    const station = await stationRepository.findOneBy({
                        registry_project_id: registryProject.id,
                    });

                    if (station) {
                        const trainStationRepository = dataSource.getRepository(AnalysisNodeEntity);
                        const trainStation = await trainStationRepository.findOneBy({
                            analysis_id: entity.id,
                            node_id: station.id,
                        });

                        if (trainStation) {
                            entity.run_station_index = trainStation.index;
                            entity.run_station_id = trainStation.node_id;

                            if (context.event === RouterEvent.ROUTED) {
                                trainStation.artifact_tag = context.data.artifactTag;

                                // operator was station ;)
                                if (context.data.operator === registryProject.account_name) {
                                    trainStation.run_status = AnalysisNodeRunStatus.DEPARTED;
                                } else {
                                    trainStation.run_status = AnalysisNodeRunStatus.ARRIVED;
                                }
                            }

                            await trainStationRepository.save(trainStation);
                        }
                    }

                    await repository.save(entity);
                    break;
                }
            }

            break;
        }
        case RouterEvent.FAILED: {
            if (context.command === RouterCommand.ROUTE) {
                entity.run_status = AnalysisRunStatus.FAILED;
                entity.run_station_id = null;
                entity.run_station_index = null;

                entity.result_status = null;

                await repository.save(entity);
            }

            if (
                isComponentContextWithError(context) &&
                context.error instanceof ComponentError
            ) {
                trainLogContext = {
                    ...trainLogContext,
                    status: AnalysisRunStatus.FAILED,

                    error: true,
                    errorCode: `${context.error.code}`,
                    step: `${context.error.step}`,
                };
            }
            break;
        }
        case RouterEvent.POSITION_NOT_FOUND: {
            entity.run_status = null;
            entity.run_station_id = null;
            entity.run_station_index = null;

            entity.result_status = null;

            await repository.save(entity);
            break;
        }
        case RouterEvent.STARTING: {
            entity.run_status = AnalysisRunStatus.STARTING;
            trainLogContext.status = AnalysisRunStatus.STARTING;
            break;
        }
        case RouterEvent.STARTED: {
            entity.run_status = AnalysisRunStatus.STARTED;
            trainLogContext.status = AnalysisRunStatus.STARTED;

            const trainStationRepository = dataSource.getRepository(AnalysisNodeEntity);
            const trainStations = await trainStationRepository.findBy({
                analysis_id: entity.id,
            });

            for (let i = 0; i < trainStations.length; i++) {
                trainStations[i].run_status = null;

                await trainStationRepository.save(trainStations[i]);
            }

            await repository.save(entity);
            break;
        }
    }

    await saveAnalysisLog(trainLogContext);
}
