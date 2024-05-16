/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { ForbiddenError } from '@ebec/http';
import { CoreCommand, buildCoreQueuePayload } from '@privateaim/server-analysis-manager';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { hasAmqpClient, useAmqpClient } from '../../../../../core';
import { runAnalysisValidation } from '../utils';
import { AnalysisEntity, ProjectEntity } from '../../../../../domains';

export async function createAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionID.ANALYSIS_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runAnalysisValidation(req, 'create');

    if (
        !result.data.master_image_id &&
        result.relation.project
    ) {
        result.data.master_image_id = result.relation.project.master_image_id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Analysis>(AnalysisEntity);

    const realm = useRequestEnv(req, 'realm');

    const entity = repository.create({
        realm_id: realm.id,
        user_id: useRequestEnv(req, 'userId'),
        ...result.data,
    });

    await repository.save(entity);

    result.relation.project.analyses++;
    const proposalRepository = dataSource.getRepository(ProjectEntity);
    await proposalRepository.save(result.relation.project);

    if (hasAmqpClient()) {
        const message = buildCoreQueuePayload({
            command: CoreCommand.CONFIGURE,
            data: {
                id: entity.id,
            },
        });

        const client = useAmqpClient();
        await client.publish(message);
    }

    return sendCreated(res, entity);
}
