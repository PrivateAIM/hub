/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Node, Registry } from '@privateaim/core-kit';
import {
    NodeType,
    RegistryProject,
} from '@privateaim/core-kit';
import type { Client, Realm, Robot } from '@authup/core-kit';
import { RegistryProjectEntity } from '../registry-project';
import { RegistryEntity } from '../registry';

@Unique(['external_name', 'registry_id'])
@Unique(['name', 'realm_id'])
@Entity({ name: 'nodes' })
export class NodeEntity implements Node {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
        external_name: string;

    @Column({
        type: 'varchar',
        length: 4096,
        nullable: true,
    })
        public_key: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'boolean', default: false })
        hidden: boolean;

    @Column({
        type: 'varchar', length: 64, default: NodeType.DEFAULT,
    })
        type: NodeType;

    @Column({
        type: 'boolean', default: false,
    })
        online: boolean;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        registry_id: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_id' })
        registry: Registry | null;

    @Column({ nullable: true })
        registry_project_id: RegistryProject['id'];

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_project_id' })
        registry_project: RegistryProject;

    @Column({ type: 'uuid', nullable: true })
        client_id: Client['id'] | null;

    @Column({ type: 'uuid', nullable: true })
        robot_id: Robot['id'] | null;

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
