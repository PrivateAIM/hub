/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import { BucketEntity } from '../bucket/index.ts';

@Unique(['bucket_id', 'path'])
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

    @Column({ type: 'int', unsigned: true, nullable: true })
        size: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'varchar', length: 64 })
        actor_type: string;

    @Column({ type: 'uuid' })
        actor_id: string;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        realm_id: Realm['id'] | null;

    // ------------------------------------------------------------------

    @Column()
        bucket_id: BucketEntity['id'];

    @ManyToOne(() => BucketEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bucket_id' })
        bucket: BucketEntity;
}
