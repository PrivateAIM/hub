/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { MasterImageCommand } from '@privateaim/core-kit';
import { useRequestBody } from '@routup/basic/body';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useMasterImageService } from '../../../../../services';

export async function commandMasterImageRouteHandler(req: Request, res: Response) {
    const body = useRequestBody(req);

    if (
        !body ||
        Object.values(MasterImageCommand).indexOf(body.command) === -1
    ) {
        throw new BadRequestError('The master image command is not valid.');
    }
    const masterImageService = useMasterImageService();

    const { command } = body;

    switch (command) {
        case MasterImageCommand.SYNC: {
            await masterImageService.synchronize();

            return sendAccepted(res);
        }
    }

    throw new NotFoundError();
}
