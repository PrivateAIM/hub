/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Bucket } from '@privateaim/storage-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'buckets' })
export class BucketEntity implements Bucket {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'varchar', length: 256, nullable: true })
        region: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        actor_id: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
        actor_type: string | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        realm_id: Realm['id'] | null;
}
