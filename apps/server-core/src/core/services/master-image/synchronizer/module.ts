/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import type { MasterImageSynchronizerGroup, MasterImageSynchronizerImage } from '@privateaim/server-core-worker-kit';
import type { IEntityRepository } from '@privateaim/server-kit';
import type { IMasterImageRepository } from '../../../entities/master-image/types.ts';
import type {
    MasterImageSynchronizerExecuteContext,
    MasterImageSynchronizerExecuteResult,
    MasterImageSynchronizerResult,
} from './types.ts';

type MasterImageSynchronizerContext = {
    imageRepository: IMasterImageRepository;
    groupRepository: IEntityRepository<MasterImageGroup>;
};

export class MasterImageSynchronizerService {
    protected imageRepository: IMasterImageRepository;

    protected groupRepository: IEntityRepository<MasterImageGroup>;

    constructor(ctx: MasterImageSynchronizerContext) {
        this.imageRepository = ctx.imageRepository;
        this.groupRepository = ctx.groupRepository;
    }

    async sync(
        input: MasterImageSynchronizerExecuteContext,
    ): Promise<MasterImageSynchronizerExecuteResult> {
        const groups = await this.syncGroups(input.groups);
        const images = await this.syncImages(input.images);

        return { groups, images };
    }

    protected async syncImages(
        input: MasterImageSynchronizerImage[],
    ): Promise<MasterImageSynchronizerResult<MasterImage>> {
        const entities = await this.imageRepository.findManyBy({});

        const result: MasterImageSynchronizerResult<MasterImage> = {
            created: [],
            updated: [],
            deleted: [],
        };

        const updates = new Map<string, Partial<MasterImage>>();

        const virtualPaths = input.map((entity) => entity.virtualPath);
        result.deleted = entities
            .filter((image) => !virtualPaths.includes(image.virtualPath));

        for (const element of input) {
            const parts = element.virtualPath.split('/');
            parts.pop();

            const data: Partial<MasterImage> = {
                name: element.name,
                path: element.path,
                groupVirtualPath: parts.join('/'),
                virtualPath: element.virtualPath,
                command: element.command,
            };

            if (element.commandArguments) {
                data.commandArguments = element.commandArguments;
            }

            const index = entities.findIndex(
                (entity) => entity.virtualPath === data.virtualPath,
            );
            if (index === -1) {
                result.created.push(this.imageRepository.create(data));
            } else {
                result.updated.push(this.imageRepository.merge(entities[index], data));
                updates.set(entities[index].id, data);
            }
        }

        for (const entity of result.created) {
            await this.imageRepository.save(entity);
        }

        // merged into the locked row, not saved from the copy read above:
        // that copy's buildStatus would be written back over a concurrent
        // build transition (save() diffs against the database).
        for (const [id, data] of updates) {
            await this.imageRepository.updateLocked(id, (locked) => {
                Object.assign(locked, data);
                return true;
            });
        }

        for (const entity of result.deleted) {
            await this.imageRepository.remove(entity);
        }

        return result;
    }

    protected async syncGroups(
        input: MasterImageSynchronizerGroup[],
    ): Promise<MasterImageSynchronizerResult<MasterImageGroup>> {
        const entities = await this.groupRepository.findManyBy({});

        const result: MasterImageSynchronizerResult<MasterImageGroup> = {
            created: [],
            updated: [],
            deleted: [],
        };

        const dirVirtualPaths: string[] = input.map((entity) => entity.virtualPath);
        result.deleted = entities.filter(
            (image) => !dirVirtualPaths.includes(image.virtualPath),
        );

        for (const element of input) {
            const data: Partial<MasterImageGroup> = {
                path: element.path,
                name: element.name,
            };

            const index = entities.findIndex((dbEntity) => dbEntity.virtualPath === element.virtualPath);
            if (index === -1) {
                result.created.push(this.groupRepository.create({
                    virtualPath: element.virtualPath,
                    ...data,
                } as Partial<MasterImageGroup>));
            } else {
                result.updated.push(this.groupRepository.merge(entities[index], data));
            }
        }

        for (const entity of result.created) {
            await this.groupRepository.save(entity);
        }

        for (const entity of result.updated) {
            await this.groupRepository.save(entity);
        }

        for (const entity of result.deleted) {
            await this.groupRepository.remove(entity);
        }

        return result;
    }
}
