/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot } from '@authup/core';
import { useAuthupClient } from '../../../../../core';
import type { NodeEntity } from '../../../../../domains';

export async function createNodeRobot(entity: NodeEntity) : Promise<Robot> {
    if (entity.robot_id) {
        throw new Error('Node Robot already exists.');
    }

    const authupClient = useAuthupClient();

    let robot : Robot;
    try {
        robot = await authupClient.robot.getOne(entity.robot_id);
    } catch (e) {
        // todo: only on 404
        robot = await authupClient.robot.create({
            name: entity.id,
            realm_id: entity.realm_id,
        });
    }

    entity.robot_id = robot.id;

    return robot;
}

export async function deleteNodeRobot(entity: NodeEntity) {
    const authupClient = useAuthupClient();

    try {
        await authupClient.robot.delete(entity.robot_id);
    } catch (e) {
        // toto: check for 404
    }

    entity.robot_id = null;
}