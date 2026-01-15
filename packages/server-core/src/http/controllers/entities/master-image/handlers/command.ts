/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { MasterImageCommand } from '@privateaim/core-kit';
import {
    MasterImageSynchronizerComponentCaller,
} from '@privateaim/server-core-worker-kit';
import { useRequestBody } from '@routup/basic/body';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useEnv } from '../../../../../config/index.ts';

export async function commandMasterImageRouteHandler(req: Request, res: Response) {
    const body = useRequestBody(req);

    if (
        !body ||
        Object.values(MasterImageCommand).indexOf(body.command) === -1
    ) {
        throw new BadRequestError('The master image command is not valid.');
    }

    const { command } = body;

    switch (command) {
        case MasterImageCommand.SYNC: {
            try {
                const caller = new MasterImageSynchronizerComponentCaller();
                await caller.callExecute({
                    owner: useEnv('masterImagesOwner'),
                    repository: useEnv('masterImagesRepository'),
                    branch: useEnv('masterImagesBranch'),
                });
            } catch (e) {
                if (e instanceof Error) {
                    throw new BadRequestError(e.message);
                }

                throw e;
            }

            return sendAccepted(res);
        }
    }

    throw new NotFoundError();
}
