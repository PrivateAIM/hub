/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RobotPermissionAction, RobotPermissionResource, isClientErrorWithStatusCode } from '@hapic/harbor';
import type { HarborClient, Robot } from '@hapic/harbor';
import type { RegistryProjectVaultPayload } from '../../../../database/domains/index.ts';
import { findRegistryProjectInVault, saveRegistryProjectToVault } from '../../../../database/domains/index.ts';

export async function ensureRemoteRegistryProjectAccount(
    httpClient: HarborClient,
    context: {
        name: string,
        account: Partial<Robot>
    },
) : Promise<Robot> {
    let robotAccount : Robot | undefined;

    let secretStorageData : RegistryProjectVaultPayload | undefined;

    if (
        !context.account.id ||
        !context.account.name ||
        !context.account.secret
    ) {
        try {
            robotAccount = await httpClient.robot.create({
                name: context.name,
                permissions: [
                    {
                        namespace: context.name,
                        kind: 'project',
                        access: [
                            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.LIST },
                            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.READ },

                            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.LIST },
                            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.PULL },

                            { resource: RobotPermissionResource.TAG, action: RobotPermissionAction.LIST },

                            { resource: RobotPermissionResource.PROJECT, action: RobotPermissionAction.READ },
                        ],
                    },
                ],
            });
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 409)) {
                secretStorageData = await findRegistryProjectInVault(context.name);

                if (secretStorageData) {
                    robotAccount = {
                        id: parseInt(secretStorageData.account_id, 10),
                        name: secretStorageData.account_name,
                        secret: secretStorageData.account_secret,
                    };

                    await httpClient.robot.updateSecret(
                        robotAccount.id,
                        robotAccount.secret,
                    );
                } else {
                    const response = await httpClient.robot
                        .getMany({
                            query: {
                                q: {
                                    name: '1',
                                },
                                page_size: 1,
                            },
                        });

                    const robotAccount = response.data.pop();
                    if (robotAccount) {
                        const { secret } = await httpClient.robot.updateSecret(
                            robotAccount.id,
                        );

                        secretStorageData = {
                            account_id: `${robotAccount.id}`,
                            account_name: robotAccount.name,
                            account_secret: secret,
                        };
                    }
                }

                await saveRegistryProjectToVault(context.name, secretStorageData);
            } else {
                throw e;
            }
        }

        if (robotAccount) {
            context.account.id = robotAccount.id;
            context.account.name = robotAccount.name;
            context.account.secret = robotAccount.secret;
        }
    } else {
        robotAccount = {
            id: context.account.id,
            name: context.account.name,
            secret: context.account.secret,
        };

        try {
            await httpClient.robot.updateSecret(
                robotAccount.id,
                robotAccount.secret,
            );

            secretStorageData = {
                account_id: `${robotAccount.id}`,
                account_name: robotAccount.name,
                account_secret: robotAccount.secret,
            };

            await saveRegistryProjectToVault(context.name, secretStorageData);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return ensureRemoteRegistryProjectAccount(httpClient, {
                    name: context.name,
                    account: {
                        id: null,
                        name: null,
                        secret: null,
                    },
                });
            }

            throw e;
        }
    }

    return robotAccount;
}
