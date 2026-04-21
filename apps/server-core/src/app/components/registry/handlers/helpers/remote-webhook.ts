/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import type {
    HarborClient,
    ProjectWebhookPolicyCreateContext,
} from '@hapic/harbor';
import {
    ServiceID,
} from '@privateaim/core-kit';
import type { Client as AuthupClient } from '@authup/core-http-kit';
import { stringifyAuthorizationHeader } from 'hapic';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        publicURL: string,
        projectIdOrName: string,
        isProjectName?: boolean,
        authupClient: AuthupClient,
    },
) : Promise<{ id: number } | undefined> {
    const { authupClient } = context;

    const client = await authupClient.client.getOne(ServiceID.REGISTRY, { fields: ['+secret'] });

    // todo: check if client.secret is not hashed or encrypted

    const webhookData: ProjectWebhookPolicyCreateContext = {
        data: {
            enabled: true,
            name: 'api',
            targets: [
                {
                    auth_header: stringifyAuthorizationHeader({
                        type: 'Basic',
                        username: client.id,
                        password: client.secret,
                    }),
                    skip_cert_verify: true,
                    address: `${context.publicURL}services/${ServiceID.REGISTRY}/hook`,
                    type: 'http',
                },
            ],
        },
        projectIdOrName: context.projectIdOrName,
        isProjectName: context.isProjectName,
    };

    try {
        const response = await httpClient
            .projectWebhookPolicy
            .create(webhookData);

        return { id: response.id };
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 409)) {
            const webhook = await httpClient.projectWebhookPolicy.findOne({
                name: 'api',
                projectIdOrName: context.projectIdOrName,
                isProjectName: context.isProjectName,
            });

            await httpClient.projectWebhookPolicy.update({
                ...webhookData,
                id: webhook.id,
            });

            return { id: webhook.id };
        }

        throw e;
    }
}
