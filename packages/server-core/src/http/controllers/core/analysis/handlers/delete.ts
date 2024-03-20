/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@privateaim/core';
import { isRealmResourceWritable } from '@authup/core';
import { CoreCommand, buildCoreQueuePayload } from '@privateaim/server-analysis-manager';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../../../config';
import { hasAmqpClient, useAmqpClient } from '../../../../../core';
import { AnalysisEntity, ProjectEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function deleteAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.ANALYSIS_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOne({ where: { id }, relations: ['project'] });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { project } = entity;

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    project.analyses--;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(project);

    if (hasAmqpClient()) {
        const message = buildCoreQueuePayload({
            command: CoreCommand.DESTROY,
            data: {
                id: entity.id,
            },
        });

        const client = useAmqpClient();
        await client.publish(message);
    }

    entity.project = project;

    return sendAccepted(res, entity);
}
