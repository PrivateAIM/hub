/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import { RegistryEntity, RegistryProjectEntity } from '../../../adapters/database/entities/index.ts';
import { RegistryCommand } from '../../components/index.ts';
import type { IRegistryCaller } from '../../../core/harbor/types.ts';
import type { IRegistryManager } from '../../../core/index.ts';

export class RegistryManagerAdapter implements IRegistryManager {
    protected registryRepository: Repository<RegistryEntity>;

    protected registryProjectRepository: Repository<RegistryProjectEntity>;

    // Either a resolved caller, or a resolver for one. A resolver matters
    // because `RegistryManagerAdapter` is constructed during
    // `DatabaseModule.setup()`, which orkos always runs before
    // `ComponentsModule.setup()` (the latter declares `dependencies: ['database']`)
    // — the caller a plain instance would carry does not exist yet at that point,
    // and would stay `undefined` forever. A resolver is instead consulted fresh on
    // every call, so it only needs the caller to exist by the time something
    // actually triggers a link/relink/unlink, which is always after every module
    // is ready.
    protected registryComponentCaller?: IRegistryCaller | (() => IRegistryCaller | undefined);

    constructor(ctx: {
        dataSource: DataSource;
        registryComponentCaller?: IRegistryCaller | (() => IRegistryCaller | undefined);
    }) {
        this.registryRepository = ctx.dataSource.getRepository(RegistryEntity);
        this.registryProjectRepository = ctx.dataSource.getRepository(RegistryProjectEntity);
        this.registryComponentCaller = ctx.registryComponentCaller;
    }

    private resolveRegistryComponentCaller(): IRegistryCaller | undefined {
        return typeof this.registryComponentCaller === 'function' ?
            this.registryComponentCaller() :
            this.registryComponentCaller;
    }

    async findDefaultRegistryId(): Promise<string | null> {
        // There is no designated "default" registry, so the oldest one stands in:
        // a node registered without an explicit choice must still come out
        // connected — an unassigned node can neither push nor pull analysis
        // images. Oldest-first keeps the fallback stable, adding a registry later
        // never re-points what new nodes connect to. An explicit `registryId` in
        // the payload always wins over this, and the assignment can be changed on
        // the node's registry tab afterwards.
        //
        // `name` breaks a `createdAt` tie: the column's resolution is coarse
        // enough for a seeder loop or an import to produce equal timestamps, and
        // ordering by `createdAt` alone would then leave the winner up to plan or
        // index order — nodes registered minutes apart could land on different
        // registries, which is exactly what oldest-first exists to prevent. `name`
        // is unique, so it is a total order, and unlike the (v4, random) `id` it
        // resolves the tie the way an admin would guess: alphabetically.
        const registry = await this.registryRepository.findOne({
            where: {},
            order: { createdAt: 'ASC', name: 'ASC' },
        });

        return registry?.id ?? null;
    }

    async createProject(data: Partial<RegistryProject>): Promise<RegistryProject> {
        const entity = this.registryProjectRepository.create(data);
        return this.registryProjectRepository.save(entity);
    }

    async findProject(id: string): Promise<RegistryProject | null> {
        return this.registryProjectRepository.findOneBy({ id });
    }

    async saveProject(project: RegistryProject): Promise<RegistryProject> {
        return this.registryProjectRepository.save(project as RegistryProjectEntity);
    }

    async removeProject(project: RegistryProject): Promise<void> {
        await this.registryProjectRepository.remove(project as RegistryProjectEntity);
    }

    async linkProject(id: string): Promise<void> {
        const caller = this.resolveRegistryComponentCaller();
        if (!caller) {
            return;
        }

        await caller.call(RegistryCommand.PROJECT_LINK, { id }, {});
    }

    async relinkProject(project: RegistryProject): Promise<void> {
        const caller = this.resolveRegistryComponentCaller();
        if (!caller) {
            return;
        }

        await caller.call(
            RegistryCommand.PROJECT_RELINK,
            {
                id: project.id,
                registryId: project.registryId,
                externalName: project.externalName,
                accountId: project.accountId,
            },
            {},
        );
    }

    async unlinkProject(project: RegistryProject): Promise<void> {
        const caller = this.resolveRegistryComponentCaller();
        if (!caller) {
            return;
        }

        await caller.call(
            RegistryCommand.PROJECT_UNLINK,
            {
                id: project.id,
                registryId: project.registryId,
                externalName: project.externalName,
                accountId: project.accountId,
            },
            {},
        );
    }
}
