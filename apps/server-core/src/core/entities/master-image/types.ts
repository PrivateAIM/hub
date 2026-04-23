/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IMasterImageRepository extends IEntityRepository<MasterImage> {

}

/**
 * Port for triggering master image synchronization on the worker.
 */
export interface IMasterImageSynchronizerCaller {
    callExecute(data: {
        owner: string; 
        repository: string; 
        branch: string 
    }): Promise<void>;
}

/**
 * Port for triggering master image build on the worker.
 */
export interface IMasterImageBuilderCaller {
    callExecute(data: { id: string }): Promise<void>;
}

export interface IMasterImageService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImage>>;
    getOne(id: string): Promise<MasterImage>;
    executeCommand(command: `${MasterImageCommand}`, data: Record<string, any>, actor: ActorContext): Promise<MasterImage | undefined>;
    delete(id: string, actor: ActorContext): Promise<MasterImage>;
}
