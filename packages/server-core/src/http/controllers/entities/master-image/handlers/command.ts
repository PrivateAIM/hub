/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import { MasterImageCommand } from '@privateaim/core-kit';
import {
    MasterImageBuilderComponentCaller,
    MasterImageSynchronizerComponentCaller,
} from '@privateaim/server-core-worker-kit';
import { useRequestBody } from '@routup/basic/body';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { ValidupError, buildErrorMessageForAttribute, defineIssueItem } from 'validup';
import { ProcessStatus } from '@privateaim/kit';
import { useEnv } from '../../../../../config/index.ts';
import { MasterImageEntity, useDataSourceSync } from '../../../../../database/index.ts';

export async function commandMasterImageRouteHandler(req: Request, res: Response) {
    const body = useRequestBody(req);

    if (
        !body ||
        Object.values(MasterImageCommand).indexOf(body.command) === -1
    ) {
        throw new ValidupError([
            defineIssueItem({
                message: buildErrorMessageForAttribute('command'),
                path: ['command'],
                expected: Object.values(MasterImageCommand).join('|'),
            }),
        ]);
    }

    const { command, id } = body;

    switch (command) {
        case MasterImageCommand.SYNC: {
            const caller = new MasterImageSynchronizerComponentCaller();
            await caller.callExecute({
                owner: useEnv('masterImagesOwner'),
                repository: useEnv('masterImagesRepository'),
                branch: useEnv('masterImagesBranch'),
            });

            return sendAccepted(res);
        }
        case MasterImageCommand.BUILD: {
            if (typeof id !== 'string' || id.length === 0) {
                throw new ValidupError([
                    defineIssueItem({
                        message: buildErrorMessageForAttribute('id'),
                        path: ['id'],
                    }),
                ]);
            }

            const dataSource = useDataSourceSync();
            const repository = dataSource.getRepository(MasterImageEntity);
            const entity = await repository.findOneBy({
                id,
            });

            if (!entity) {
                throw new NotFoundError();
            }

            const caller = new MasterImageBuilderComponentCaller();
            entity.build_status = ProcessStatus.STARTING;

            await caller.callExecute({ id: entity.id });

            await repository.save(entity);

            return sendAccepted(res, entity);
        }
    }

    throw new NotFoundError();
}
