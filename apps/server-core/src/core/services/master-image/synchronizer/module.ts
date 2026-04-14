/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDataSource } from 'typeorm-extension';
import type { MasterImageSynchronizerGroup, MasterImageSynchronizerImage } from '@privateaim/server-core-worker-kit';
import { MasterImageEntity, MasterImageGroupEntity } from '../../../../adapters/database/index.ts';

export type MasterImageSynchronizerExecuteContext = {
    images: MasterImageSynchronizerImage[],
    groups: MasterImageSynchronizerGroup[]
};

export type MasterImageSynchronizerResult<T> = {
    updated: T[],
    created: T[],
    deleted: T[]
};

export type MasterImageSynchronizerExecuteResult = {
    images: MasterImageSynchronizerResult<MasterImageEntity>,
    groups: MasterImageSynchronizerResult<MasterImageGroupEntity>
};

export class MasterImageSynchronizerService {
    async sync(
        input: MasterImageSynchronizerExecuteContext,
    ) : Promise<MasterImageSynchronizerExecuteResult> {
        const groups = await this.syncGroups(input.groups);
        const images = await this.syncImages(input.images);

        return {
            groups,
            images,
        };
    }

    protected async syncImages(
        input: MasterImageSynchronizerImage[],
    ) : Promise<MasterImageSynchronizerResult<MasterImageEntity>> {
        const dataSource = await useDataSource();

        const repository = dataSource.getRepository(MasterImageEntity);
        const entities = await repository.find();

        const result : MasterImageSynchronizerResult<MasterImageEntity> = {
            created: [],
            updated: [],
            deleted: [],
        };

        const virtualPaths = input.map((entity) => entity.virtualPath);
        result.deleted = entities
            .filter((image) => !virtualPaths.includes(image.virtual_path));

        for (const element of input) {
            const parts = element.virtualPath.split('/');
            parts.pop();

            const data : Partial<MasterImageEntity> = {
                name: element.name,
                path: element.path,
                group_virtual_path: parts.join('/'),
                virtual_path: element.virtualPath,
                command: element.command,
            };

            if (element.commandArguments) {
                data.command_arguments = element.commandArguments;
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

    protected async syncGroups(
        input: MasterImageSynchronizerGroup[],
    ) : Promise<MasterImageSynchronizerResult<MasterImageGroupEntity>> {
        const dataSource = await useDataSource();

        const repository = dataSource.getRepository(MasterImageGroupEntity);
        const entities = await repository.find();

        const result : MasterImageSynchronizerResult<MasterImageGroupEntity> = {
            created: [],
            updated: [],
            deleted: [],
        };

        const dirVirtualPaths : string[] = input.map((entity) => entity.virtualPath);
        result.deleted = entities.filter(
            (image) => !dirVirtualPaths.includes(image.virtual_path),
        );

        for (const element of input) {
            const data : Partial<MasterImageGroupEntity> = {
                path: element.path,
                name: element.name,
            };

            const index = entities.findIndex((dbEntity) => dbEntity.virtual_path === element.virtualPath);
            if (index === -1) {
                result.created.push(repository.create({
                    virtual_path: element.virtualPath,
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
