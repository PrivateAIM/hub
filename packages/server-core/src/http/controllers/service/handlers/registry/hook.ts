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
    useLogger,
} from '@privateaim/server-kit';
import {
    RegistryCommand,
    RegistryHookSchema,
    useRegistryComponentCaller,
} from '../../../../../components';

export async function postHarborHookRouteHandler(req: Request, res: Response) : Promise<any> {
    const body = useRequestBody(req);

    const validation = await RegistryHookSchema.safeParseAsync(body);
    if (validation.success === false) {
        useLogger().warn('The registry hook has a malformed shape.', { error: validation.error });
        return sendAccepted(res);
    }

    const caller = useRegistryComponentCaller();
    await caller.call(
        RegistryCommand.HOOK_HANDLE,
        {
            event: validation.data.type,
            operator: validation.data.operator,
            namespace: validation.data.event_data.repository.namespace,
            repositoryName: validation.data.event_data.repository.name,
            repositoryFullName: validation.data.event_data.repository.repo_full_name,
            artifactTag: validation.data.event_data.resources[0]?.tag,
            artifactDigest: validation.data.event_data.resources[0]?.digest,
        },
        {},
    );

    return sendAccepted(res);
}
