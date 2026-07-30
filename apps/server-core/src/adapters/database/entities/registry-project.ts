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
import type { Registry, RegistryProject } from '@privateaim/core-kit';
import {
    RegistryProjectType,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import { RegistryEntity } from './registry.ts';

@Unique(['name', 'registryId'])
@Unique(['externalName', 'registryId'])
@Unique(['externalId', 'registryId'])
@Entity({ name: 'registry_projects' })
export class RegistryProjectEntity implements RegistryProject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 128 })
    name: string;

    @Column({
        type: 'varchar', 
        length: 64, 
        nullable: true, 
        default: RegistryProjectType.DEFAULT,
    })
    type: `${RegistryProjectType}`;

    @Column({ type: 'boolean', default: true })
    public: boolean;

    // ------------------------------------------------------------------

    @Column({
        name: 'external_name',
        type: 'varchar',
        length: 64,
    })
    externalName: string;

    @Column({
        name: 'external_id',
        type: 'varchar',
        length: 64,
        nullable: true,
        default: null,
    })
    externalId: string | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'account_id',
        type: 'varchar', 
        length: 64, 
        nullable: true,
    })
    accountId: string | null;

    @Column({
        name: 'account_name',
        type: 'varchar', 
        length: 256, 
        nullable: true,
    })
    accountName: string | null;

    @Column({
        name: 'account_secret',
        type: 'varchar', 
        length: 256, 
        nullable: true, 
        select: false,
    })
    accountSecret: string | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'webhook_name',
        type: 'varchar', 
        length: 128, 
        default: null, 
        nullable: true,
    })
    webhookName: string | null;

    @Column({
        name: 'webhook_exists', 
        type: 'boolean', 
        default: false, 
    })
    webhookExists: boolean;

    // ------------------------------------------------------------------

    @Column({ name: 'registry_id' })
    registryId: Registry['id'];

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'registry_id' })
    registry: RegistryEntity;

    // ------------------------------------------------------------------

    @Column({
        name: 'realm_id', 
        type: 'uuid', 
        nullable: true, 
    })
    realmId: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
