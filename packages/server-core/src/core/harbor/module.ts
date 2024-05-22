/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseConnectionString } from '@hapic/harbor';
import { getHostNameFromString } from '@privateaim/core';
import { useDataSource } from 'typeorm-extension';
import { hasAmqpClient, useAmqpClient } from '@privateaim/server-kit';
import { RegistryCommand, buildRegistryPayload } from '../../components';
import { RegistryEntity } from '../../domains';
import { useEnv } from '../../config';

export async function setupHarborService() {
    const harborURL = useEnv('harborURL');
    if (!harborURL) {
        return;
    }

    const connection = parseConnectionString(harborURL);
    const host = getHostNameFromString(connection.host);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    let entity = await repository.findOneBy({
        host,
    });
    if (entity) {
        entity.account_name = connection.user;
        entity.account_secret = connection.password;
    } else {
        entity = repository.create({
            name: 'default',
            host,
            account_name: connection.user,
            account_secret: connection.password,
        });
    }

    await repository.save(entity);

    if (!hasAmqpClient()) {
        return;
    }

    const client = useAmqpClient();

    const queueMessage = buildRegistryPayload({
        command: RegistryCommand.SETUP,
        data: {
            id: entity.id,
        },
    });

    await client.publish(queueMessage);
}
