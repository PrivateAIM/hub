/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import { bigintNumberTransformer, dateToISOStringTransformer } from '@privateaim/server-db-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { BucketEntity } from './bucket.ts';

@Unique(['bucketId', 'path'])
@Entity({ name: 'bucket_files' })
export class BucketFileEntity implements BucketFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 256 })
    name: string;

    @Column({ type: 'varchar', length: 512 })
    path: string;

    @Column({ type: 'varchar', length: 4096 })
    hash: string;

    @Column({ nullable: true })
    directory: string;

    @Column({
        type: 'bigint',
        unsigned: true,
        nullable: true,
        transformer: bigintNumberTransformer,
    })
    size: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Column({
        name: 'actor_type', 
        type: 'varchar', 
        length: 64, 
    })
    actorType: string;

    @Column({ name: 'actor_id', type: 'uuid' })
    actorId: string;

    // ------------------------------------------------------------------

    @Column({
        name: 'realm_id', 
        type: 'uuid', 
        nullable: true, 
    })
    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    @Column({ name: 'bucket_id' })
    bucketId: BucketEntity['id'];

    @ManyToOne(() => BucketEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bucket_id' })
    bucket: BucketEntity;
}
