/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEntity, MasterImageGroupEntity } from '../../../domains';

export type MasterImageDatabaseSyncResult<T> = {
    updated: T[],
    created: T[],
    deleted: T[]
};

export class MasterImageDatabaseService {
    async synchronize(input: Image[]) : Promise<MasterImageDatabaseSyncResult<MasterImageEntity>> {
        const dataSource = await useDataSource();

        const virtualPaths = input.map((entity) => entity.virtualPath);

        const repository = dataSource.getRepository(MasterImageEntity);
        const entities = await repository.find();

        const result : MasterImageDatabaseSyncResult<MasterImageEntity> = {
            created: [],
            updated: [],
            deleted: [],
        };

        result.deleted = entities
            .filter((image) => virtualPaths.indexOf(image.virtual_path) === -1);

        for (let i = 0; i < input.length; i++) {
            const parts = input[i].virtualPath.split('/');
            parts.pop();

            const data : Partial<MasterImageEntity> = {
                name: input[i].name,
                path: input[i].path,
                group_virtual_path: parts.join('/'),
                virtual_path: input[i].virtualPath,
            };

            if (typeof input[i].command === 'string') {
                data.command = input[i].command;
            }

            if (typeof input[i].commandArguments !== 'undefined') {
                data.command_arguments = input[i].commandArguments;
            }

            const index = entities.findIndex(
                (entity) => entity.virtual_path === data.virtual_path,
            );
            if (index === -1) {
                result.created.push(repository.create(data));
            } else {
                result.updated.push(repository.merge(entities[index], data));
            }
        }

        if (result.created.length > 0) {
            await repository.insert(result.created);
        }

        if (result.updated.length > 0) {
            await repository.save(result.updated);
        }

        if (result.deleted.length > 0) {
            await repository.remove(result.deleted);
        }

        return result;
    }

    async synchronizeGroups(input: Group[]) : Promise<MasterImageDatabaseSyncResult<MasterImageGroupEntity>> {
        const dataSource = await useDataSource();

        const dirVirtualPaths : string[] = input.map((entity) => entity.virtualPath);

        const repository = dataSource.getRepository(MasterImageGroupEntity);
        const entities = await repository.find();

        const result : MasterImageDatabaseSyncResult<MasterImageGroupEntity> = {
            created: [],
            updated: [],
            deleted: [],
        };

        // db entries which does not exist anymore
        result.deleted = entities.filter(
            (image) => dirVirtualPaths.indexOf(image.virtual_path) === -1,
        );

        for (let i = 0; i < input.length; i++) {
            const data : Partial<MasterImageGroupEntity> = {
                name: input[i].name,
                path: input[i].path,
            };

            if (typeof input[i].command === 'string') {
                data.command = input[i].command;
            }

            if (typeof input[i].commandArguments !== 'undefined') {
                data.command_arguments = input[i].commandArguments;
            }

            const index = entities.findIndex((dbEntity) => dbEntity.virtual_path === input[i].virtualPath);
            if (index === -1) {
                result.created.push(repository.create({
                    virtual_path: input[i].virtualPath,
                    ...data,
                }));
            } else {
                result.updated.push(repository.merge(entities[index], data));
            }
        }

        if (result.created.length > 0) {
            await repository.save(result.created);
        }

        if (result.updated.length > 0) {
            await repository.save(result.updated);
        }

        if (result.deleted.length > 0) {
            await repository.remove(result.deleted);
        }

        return result;
    }
}
