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
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import {
    NodeType,
} from '@privateaim/core-kit';
import type { Client, Realm } from '@authup/core-kit';
import { RegistryProjectEntity } from './registry-project.ts';
import { RegistryEntity } from './registry.ts';

@Unique(['externalName', 'registryId'])
@Unique(['name', 'realmId'])
@Entity({ name: 'nodes' })
export class NodeEntity implements Node {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'external_name',
        type: 'varchar', 
        length: 64, 
        nullable: true, 
    })
    externalName: string;

    @Column({
        name: 'public_key',
        type: 'varchar',
        length: 4096,
        nullable: true,
    })
    publicKey: string;

    @Column({ type: 'varchar', length: 128 })
    name: string;

    @Column({ type: 'boolean', default: false })
    hidden: boolean;

    @Column({
        type: 'varchar', 
        length: 64, 
        default: NodeType.DEFAULT,
    })
    type: `${NodeType}`;

    @Column({ type: 'boolean', default: false })
    online: boolean;

    // ------------------------------------------------------------------

    // Both registry references detach on delete rather than cascade. A node is
    // an independent, long-lived resource (it owns its realm, crypto keys and
    // client credentials) that merely *points at* registry-side rows — deleting
    // a registry or a registry project must never take the node down with it.
    // The node is simply left unassigned and can be reconnected.
    @Column({ name: 'registry_id', nullable: true })
    registryId: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'registry_id' })
    registry: Registry | null;

    @Column({ name: 'registry_project_id', nullable: true })
    registryProjectId: RegistryProject['id'] | null;

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'registry_project_id' })
    registryProject: RegistryProject | null;

    @Column({
        name: 'client_id', 
        type: 'uuid', 
        nullable: true, 
    })
    clientId: Client['id'] | null;

    @Column({
        name: 'robot_id', 
        type: 'uuid', 
        nullable: true, 
    })
    robotId: Client['id'] | null;

    @Column({ name: 'realm_id', type: 'uuid' })
    realmId: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
