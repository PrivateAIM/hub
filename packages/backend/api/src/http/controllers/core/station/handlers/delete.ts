/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { isPermittedForResourceRealm } from '@authelion/common';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { buildSecretStorageQueueMessage } from '../../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/special/secret-storage/constants';
import env from '../../../../../env';
import { deleteStationFromSecretStorage } from '../../../../../components/secret-storage/handlers/entities/station';
import { deleteStationFromRegistry } from '../../../../../components/registry/handlers/entities/station';
import { RegistryQueueCommand, RegistryQueueEntityType } from '../../../../../domains/special/registry/constants';
import { buildRegistryQueueMessage } from '../../../../../domains/special/registry/queue';

export async function deleteStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(StationEntity);

    const query = repository.createQueryBuilder('station')
        .addSelect('station.secure_id')
        .addSelect('station.registry_project_id')
        .addSelect('station.registry_project_account_id')
        .where({
            id,
        })
        .getOne();

    const entity = await query;

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (env.env === 'test') {
        await deleteStationFromRegistry({
            type: RegistryQueueEntityType.STATION,
            id: entity.id,
            secure_id: entity.secure_id,
            registry_project_id: entity.registry_project_id,
            registry_project_account_id: entity.registry_project_account_id,
        });
    } else {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.DELETE,
            {
                type: RegistryQueueEntityType.STATION,
                id: entity.id,
                secure_id: entity.secure_id,
                registry_project_id: entity.registry_project_id,
                registry_project_account_id: entity.registry_project_account_id,
            },
        );
        await publishMessage(queueMessage);
    }

    if (env.env === 'test') {
        await deleteStationFromSecretStorage({
            type: SecretStorageQueueEntityType.STATION,
            id: entity.id,
            secure_id: entity.secure_id,
        });
    } else {
        const queueMessage = buildSecretStorageQueueMessage(
            SecretStorageQueueCommand.DELETE,
            {
                type: SecretStorageQueueEntityType.STATION,
                id: entity.id,
                secure_id: entity.secure_id,
            },
        );
        await publishMessage(queueMessage);
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return res.respondDeleted({ data: entity });
}
