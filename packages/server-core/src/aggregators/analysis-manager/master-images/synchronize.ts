/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Group, Image } from 'docker-scan';
import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEntity, MasterImageGroupEntity } from '../../../domains';

export type ReturnContext<T> = {
    updated: T[],
    created: T[],
    deleted: T[]
};

export async function syncMasterImages(
    input: Image[],
) : Promise<ReturnContext<MasterImage>> {
    const dataSource = await useDataSource();

    const virtualPaths = input.map((entity) => entity.virtualPath);

    const repository = dataSource.getRepository(MasterImageEntity);
    const entities = await repository.find();

    const context : ReturnContext<MasterImage> = {
        created: [],
        updated: [],
        deleted: [],
    };

    context.deleted = entities
        .filter((image) => virtualPaths.indexOf(image.virtual_path) === -1);

    for (let i = 0; i < input.length; i++) {
        const parts = input[i].virtualPath.split('/');
        parts.pop();

        const data : Partial<MasterImage> = {
            name: input[i].name,
            path: input[i].path,
            group_virtual_path: parts.join('/'),
            virtual_path: input[i].virtualPath,
        };

        if (typeof input[i].command === 'string') {
            data.command = input[i].command;
        }

        if (typeof input[i].command_arguments !== 'undefined') {
            data.command_arguments = input[i].commandArguments;
        }

        const index = entities.findIndex(
            (entity) => entity.virtual_path === data.virtual_path,
        );
        if (index === -1) {
            context.created.push(repository.create(data));
        } else {
            context.updated.push(repository.merge(entities[index], data));
        }
    }

    if (context.created.length > 0) {
        await repository.save(context.created);
    }

    if (context.updated.length > 0) {
        await repository.save(context.updated);
    }

    if (context.deleted.length > 0) {
        await repository.remove(context.deleted);
    }

    return context;
}

export async function syncMasterImageGroups(
    input: Group[],
) : Promise<ReturnContext<MasterImageGroup>> {
    const dataSource = await useDataSource();

    const dirVirtualPaths : string[] = input.map((entity) => entity.virtualPath);

    const repository = dataSource.getRepository(MasterImageGroupEntity);
    const entities = await repository.find();

    const context : ReturnContext<MasterImageGroup> = {
        created: [],
        updated: [],
        deleted: [],
    };

    // db entries which does not exist anymore
    context.deleted = entities.filter(
        (image) => dirVirtualPaths.indexOf(image.virtual_path) === -1,
    );

    for (let i = 0; i < input.length; i++) {
        const data : Partial<MasterImageGroup> = {
            name: input[i].name,
            path: input[i].path,
        };

        if (typeof input[i].command === 'string') {
            data.command = input[i].command;
        }

        if (typeof input[i].command_arguments !== 'undefined') {
            data.command_arguments = input[i].commandArguments;
        }

        const index = entities.findIndex((dbEntity) => dbEntity.virtual_path === input[i].virtualPath);
        if (index === -1) {
            context.created.push(repository.create({
                virtual_path: input[i].virtualPath,
                ...data,
            }));
        } else {
            context.updated.push(repository.merge(entities[index], data));
        }
    }

    if (context.created.length > 0) {
        await repository.save(context.created);
    }

    if (context.updated.length > 0) {
        await repository.save(context.updated);
    }

    if (context.deleted.length > 0) {
        await repository.remove(context.deleted);
    }

    return context;
}
