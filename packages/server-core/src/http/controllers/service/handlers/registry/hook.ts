/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestBody } from '@routup/basic/body';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import {
    RegistryCommand,
    useRegistryComponentCaller,
} from '../../../../../components';

export async function postHarborHookRouteHandler(req: Request, res: Response) : Promise<any> {
    const body = useRequestBody(req);

    const caller = useRegistryComponentCaller();
    await caller.call(
        RegistryCommand.HOOK_PROCESS,
        body,
        {},
    );

    return sendAccepted(res);
}
