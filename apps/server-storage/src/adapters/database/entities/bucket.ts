/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import type { Realm } from '@authup/core-kit';
import type { Bucket } from '@privateaim/storage-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'buckets' })
export class BucketEntity implements Bucket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 256 })
    name: string;

    @Column({
        type: 'varchar',
        length: 256,
        nullable: true,
    })
    region: string | null;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'actor_id',
        type: 'uuid',
        nullable: true,
    })
    actorId: string | null;

    @Index()
    @Column({
        name: 'actor_type',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    actorType: string | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'realm_id',
        type: 'uuid',
        nullable: true,
    })
    realmId: Realm['id'] | null;
}
