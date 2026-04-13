/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionName,
} from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { LogComponentWriteHandler } from '../../../../components/log/handlers/index.ts';

export async function createLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.LOG_CREATE });

    // todo: maybe singleton instance
    const component = new LogComponentWriteHandler();
    const data = await component.validateWithRequest(req);

    const entity = await component.write(data);

    return sendCreated(res, entity);
}
