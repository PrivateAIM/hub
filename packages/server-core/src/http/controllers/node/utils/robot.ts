/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot } from '@authup/core-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import type { NodeEntity } from '../../../../domains';

export async function createNodeRobot(entity: NodeEntity) : Promise<void> {
    if (!isAuthupClientUsable()) {
        return;
    }

    const authupClient = useAuthupClient();

    let robot : Robot | undefined;
    if (entity.robot_id) {
        try {
            robot = await authupClient.robot.getOne(entity.robot_id);
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }
    }

    if (typeof robot === 'undefined') {
        robot = await authupClient.robot.create({
            name: entity.id,
            realm_id: entity.realm_id,
        });
    }

    entity.robot_id = robot.id;
}

export async function deleteNodeRobot(entity: NodeEntity) : Promise<void> {
    if (!isAuthupClientUsable() || !entity.robot_id) {
        return;
    }

    const authupClient = useAuthupClient();

    try {
        await authupClient.robot.delete(entity.robot_id);
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    entity.robot_id = null;
}
