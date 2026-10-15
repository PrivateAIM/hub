/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageCommand } from '@privateaim/core-kit';
import type {
    ActorContext,
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
} from '@privateaim/server-kit';

export interface IMasterImageRepository extends IEntityRepository<MasterImage> {
    /**
     * Read the row under a write lock, let `fn` check and mutate it, and save
     * it when `fn` returns true — atomically across replicas. Resolves the
     * saved row, or null when it is missing or `fn` returned false; a throw
     * in `fn` rolls back.
     */
    updateLocked(id: string, fn: (entity: MasterImage) => boolean, ctx?: EntityPersistContext): Promise<MasterImage | null>;
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
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<MasterImage>>;
    getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<MasterImage>;
    executeCommand(command: `${MasterImageCommand}`, data: Record<string, any>, actor: ActorContext): Promise<MasterImage | undefined>;
    delete(id: string, actor: ActorContext): Promise<MasterImage>;
}
