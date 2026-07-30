/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import {
    Column, 
    CreateDateColumn, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn,
} from 'typeorm';
import type { MasterImage, Project } from '@privateaim/core-kit';
import type {
    Client, 
    Realm, 
    User,
} from '@authup/core-kit';
import { MasterImageEntity } from './master-image.ts';

@Entity({ name: 'projects' })
export class ProjectEntity implements Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 256,
        unique: true,
    })
    name: string;

    @Column({
        name: 'display_name',
        type: 'varchar',
        length: 256,
        nullable: true,
        default: null,
    })
    displayName: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    // ------------------------------------------------------------------

    @Column({
        type: 'int', 
        unsigned: true, 
        default: 0, 
    })
    analyses: number;

    @Column({
        type: 'int', 
        unsigned: true, 
        default: 0, 
    })
    nodes: number;

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Column({ name: 'realm_id', type: 'uuid' })
    realmId: Realm['id'];

    @Column({
        name: 'client_id', 
        type: 'uuid', 
        nullable: true, 
    })
    clientId: Client['id'] | null;

    @Column({
        name: 'user_id', 
        type: 'uuid', 
        nullable: true, 
    })
    userId: User['id'] | null;

    @Column({
        name: 'robot_id', 
        type: 'uuid', 
        nullable: true, 
    })
    robotId: Client['id'] | null;

    @Column({
        name: 'master_image_id', 
        nullable: true, 
        default: null, 
    })
    masterImageId: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
    masterImage: MasterImageEntity | null;
}
