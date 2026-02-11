/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { MasterImage, Project } from '@privateaim/core-kit';
import type {
    Client, Realm, Robot, User,
} from '@authup/core-kit';
import { MasterImageEntity } from '../master-image/index.ts';

@Entity({ name: 'projects' })
export class ProjectEntity implements Project {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256, unique: true })
        name: string;

    @Column({ type: 'text', nullable: true })
        description: string | null;

    // ------------------------------------------------------------------

    @Column({ type: 'int', unsigned: true, default: 0 })
        analyses: number;

    @Column({ type: 'int', unsigned: true, default: 0 })
        nodes: number;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    @Column({ type: 'uuid', nullable: true })
        client_id: Client['id'] | null;

    @Column({ type: 'uuid', nullable: true })
        user_id: User['id'] | null;

    @Column({ type: 'uuid', nullable: true })
        robot_id: Robot['id'] | null;

    @Column({ nullable: true, default: null })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity | null;
}
