/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    isClientErrorWithStatusCode,
} from 'hapic';
import { hasVaultClient, useVaultClient } from '../../core';
import type { RobotVaultPayload } from './type';
import { isRobotVaultPayload } from './utils';

export async function findRobotCredentialsInVault(
    name: string,
) : Promise<RobotVaultPayload | undefined> {
    if (!hasVaultClient()) {
        return undefined;
    }

    const client = useVaultClient();

    try {
        const response = await client.keyValueV1.getOne(
            'robots',
            name,
        );

        if (
            response &&
            response.data &&
            isRobotVaultPayload(response.data)
        ) {
            return response.data;
        }

        return undefined;
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            return undefined;
        }

        throw e;
    }
}
