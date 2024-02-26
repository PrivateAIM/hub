/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot, User } from '@authup/core';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'buckets' })
export class BucketEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'varchar', length: 256, nullable: true })
        region: string | null;

    @Column({ type: 'varchar', length: 256, nullable: true })
        ref_type: string | null;

    @Column({ type: 'varchar', length: 256, nullable: true })
        ref_id: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        actor_id: string;

    @Column({ type: 'varchar', length: 64 })
        actor_type: string;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        realm_id: Realm['id'] | null;
}
