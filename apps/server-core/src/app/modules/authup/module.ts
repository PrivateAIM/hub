/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ServerError } from '@ebec/http';
import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { ServiceID } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    AUTHUP_CLIENT_MODULE_NAME,
    AuthupClientInjectionKey,
    LoggerInjectionKey,
} from '@privateaim/server-kit';

export class AuthupModule implements IModule {
    readonly name = 'authup';

    readonly dependencies: string[] = [AUTHUP_CLIENT_MODULE_NAME];

    async setup(container: IContainer): Promise<void> {
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        if (!authupResult.success) {
            return;
        }

        const authupClient = authupResult.data;
        const logger = container.resolve(LoggerInjectionKey);

        let realm: Realm;

        try {
            realm = await authupClient.realm.getOne(REALM_MASTER_NAME);
        } catch {
            throw new ServerError(`The ${REALM_MASTER_NAME} does not exist.`);
        }

        await authupClient.robot.getOne(ServiceID.SYSTEM);

        const { data: clients } = await authupClient.client.getMany({
            filter: {
                realm_id: realm.id,
                name: ServiceID.REGISTRY,
            },
        });

        if (clients.length === 0) {
            await authupClient.client.create({
                name: ServiceID.REGISTRY,
                realm_id: realm.id,
            });

            logger.debug(`Client ${ServiceID.REGISTRY} created.`);
        } else {
            logger.debug(`Client ${ServiceID.REGISTRY} already exists.`);
        }

        const permissionNames = Object.values(PermissionName);
        for (const permissionName of permissionNames) {
            try {
                await authupClient.permission.create({
                    name: permissionName,
                    realm_id: null,
                    client_id: null,
                });

                logger.debug(`Created permission ${permissionName}`);
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 409)) {
                    logger.debug(`Permission ${permissionName} already exists`);
                } else {
                    throw e;
                }
            }
        }
    }
}
