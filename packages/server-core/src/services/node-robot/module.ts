/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Permission, Robot } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient } from '@privateaim/server-kit';
import { useAuthupClient, useLogger } from '@privateaim/server-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { NodeEntity } from '../../database';

export class NodeRobotService {
    protected authup : AuthupClient;

    constructor() {
        this.authup = useAuthupClient();
    }

    async delete(entity: NodeEntity) : Promise<void> {
        if (!entity.robot_id) {
            return;
        }

        try {
            await this.authup.robot.delete(entity.robot_id);
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }

        entity.robot_id = null;
    }

    async assign(entity: NodeEntity) : Promise<Robot> {
        let robot : Robot | undefined;

        if (entity.robot_id) {
            try {
                robot = await this.authup.robot.getOne(entity.robot_id);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }
            }
        }

        if (!robot) {
            robot = await this.authup.robot.create({
                name: entity.id,
                realm_id: entity.realm_id,
            });

            entity.robot_id = robot.id;
        }

        return robot;
    }

    async assignPermissions(robot: Robot) {
        const { data: robotPermissions } = await this.authup
            .robotPermission.getMany({
                relations: {
                    permission: true,
                },
                filter: {
                    robot_id: robot.id,
                },
            });

        const permissionNames : string[] = [
            PermissionName.ANALYSIS_APPROVE,
            PermissionName.ANALYSIS_UPDATE,
            PermissionName.PROJECT_APPROVE,
        ];
        const permissionNamesAssigned : string[] = [];

        const relationsToDelete : string[] = [];
        for (let i = 0; i < robotPermissions.length; i++) {
            const index = permissionNames.indexOf(robotPermissions[i].permission.name);
            if (index === -1) {
                relationsToDelete.push(robotPermissions[i].id);
            }

            permissionNamesAssigned.push(robotPermissions[i].permission.name);
        }

        if (relationsToDelete.length > 0) {
            for (let i = 0; i < relationsToDelete.length; i++) {
                await this.authup.robotPermission.delete(relationsToDelete[i]);
            }
        }

        for (let i = 0; i < permissionNames.length; i++) {
            const index = permissionNamesAssigned.indexOf(permissionNames[i]);
            if (index !== -1) {
                continue;
            }

            let permission : Permission;

            try {
                permission = await this.authup.permission.getOne(permissionNames[i]);
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    throw e;
                }

                useLogger()
                    .warn(`The node-robot permission could not be created, due non existing permission ${permissionNames[i]}.`);
            }

            if (permission) {
                await this.authup.robotPermission.create({
                    robot_id: robot.id,
                    permission_id: permission.id,
                });
            }
        }
    }
}
