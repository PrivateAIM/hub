/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Node, Registry } from '@personalhealthtrain/core';
import {
    RegistryProject,
} from '@personalhealthtrain/core';
import type {Realm, Robot} from '@authup/core';
import { RegistryProjectEntity } from '../registry-project';
import { RegistryEntity } from '../registry';

@Unique('node_external_name_index', ['external_name'])
@Unique(['name', 'realm_id'])
@Entity({ name: 'nodes' })
export class NodeEntity implements Node {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
        external_name: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        email: string | null;

    @Column({ type: 'boolean', default: false })
        hidden: boolean;

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
        robot_id: Robot['id'] | null;

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @BeforeInsert()
    @BeforeUpdate()
    setHidden() {
        if (!this.registry_id) {
            this.hidden = true;
        }
    }
}
