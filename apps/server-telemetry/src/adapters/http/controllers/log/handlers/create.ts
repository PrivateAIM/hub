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
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { LogValidator } from '@privateaim/telemetry-kit';
import type { LogStore } from '../../../../../core/services/log-store/types.ts';

export async function createLogRouteHandler(req: Request, res: Response, logStore: LogStore) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.LOG_CREATE });

    const validator = new LogValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req);

    const entity = await logStore.write(data);

    return sendCreated(res, entity);
}
