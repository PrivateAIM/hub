/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, Realm, User } from '@authup/core-kit';
import type {
    Analysis,
    MasterImage,
    MasterImageCommandArgument,
    Project,
    Registry,
} from '@privateaim/core-kit';
import { bigintNumberTransformer, dateToISOStringTransformer, serializedTextTransformer } from '@privateaim/server-db-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { ProcessStatus } from '@privateaim/kit';
import { MasterImageEntity } from './master-image.ts';
import { ProjectEntity } from './project.ts';
import { RegistryEntity } from './registry.ts';

@Entity({ name: 'analyses' })
export class AnalysisEntity implements Analysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({
        type: 'varchar',
        length: 128,
        nullable: false,
    })
    name: string;

    @Index()
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

    @Column({
        type: 'int', 
        unsigned: true, 
        default: 0, 
    })
    nodes: number;

    @Column({
        name: 'nodes_approved',
        type: 'int', 
        unsigned: true, 
        default: 0, 
    })
    nodesApproved: number;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'configuration_locked',
        type: 'boolean',
        default: false,
    })
    configurationLocked: boolean;

    @Column({
        name: 'configuration_entrypoint_valid', 
        type: 'boolean', 
        default: false, 
    })
    configurationEntrypointValid: boolean;

    @Column({
        name: 'configuration_image_valid', 
        type: 'boolean', 
        default: false, 
    })
    configurationImageValid: boolean;

    @Column({
        name: 'configuration_node_aggregator_valid', 
        type: 'boolean', 
        default: false, 
    })
    configurationNodeAggregatorValid: boolean;

    @Column({
        name: 'configuration_node_default_valid', 
        type: 'boolean', 
        default: false, 
    })
    configurationNodeDefaultValid: boolean;

    @Column({
        name: 'configuration_nodes_valid', 
        type: 'boolean', 
        default: false, 
    })
    configurationNodesValid: boolean;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'distribution_status',
        type: 'varchar', 
        length: 64, 
        nullable: true, 
        default: null,
    })
    distributionStatus: `${ProcessStatus}` | null;

    @Column({
        name: 'distribution_progress',
        type: 'int', 
        unsigned: true, 
        nullable: true, 
        default: null,
    })
    distributionProgress: number | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'build_nodes_valid', 
        type: 'boolean', 
        default: false, 
    })
    buildNodesValid: boolean;

    @Index()
    @Column({
        name: 'build_status',
        type: 'varchar', 
        length: 64, 
        nullable: true, 
        default: null,
    })
    buildStatus: `${ProcessStatus}` | null;

    @Column({
        name: 'build_progress',
        type: 'int', 
        unsigned: true, 
        nullable: true, 
        default: null,
    })
    buildProgress: number | null;

    // sha512:<128 hex> = 135
    @Column({
        name: 'build_hash',
        type: 'varchar',
        length: 135,
        nullable: true,
        default: null,
    })
    buildHash: string | null;

    @Column({
        name: 'build_os',
        type: 'varchar',
        length: 10,
        nullable: true,
        default: null,
    })
    buildOs: string | null;

    @Column({
        name: 'build_size',
        type: 'bigint',
        unsigned: true,
        nullable: true,
        default: null,
        transformer: bigintNumberTransformer,
    })
    buildSize: number | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'execution_status',
        type: 'varchar', 
        length: 64, 
        nullable: true, 
        default: null,
    })
    executionStatus: `${ProcessStatus}` | null;

    @Column({
        name: 'execution_progress',
        type: 'int', 
        unsigned: true, 
        nullable: true, 
        default: null,
    })
    executionProgress: number | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'image_command_arguments',
        type: 'text',
        nullable: true,
        transformer: serializedTextTransformer,
    })
    imageCommandArguments: MasterImageCommandArgument[] | null;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    // Detach on delete rather than cascade. A null `registryId` is the normal
    // pre-distribution state — `AnalysisDistributor.assignRegistry()` fills it
    // in lazily — so losing the registry returns the analysis to a state the
    // domain already handles. Cascading instead destroyed the analysis together
    // with its buckets, bucket files, nodes and node events.
    @Column({ name: 'registry_id', nullable: true })
    registryId: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'registry_id' })
    registry: RegistryEntity | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'client_id', 
        type: 'uuid', 
        nullable: true, 
    })
    clientId: Client['id'] | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({ name: 'realm_id', type: 'uuid' })
    realmId: Realm['id'];

    // ------------------------------------------------------------------

    @Column({
        name: 'user_id',
        nullable: true,
        type: 'uuid',
    })
    userId: User['id'];

    // ------------------------------------------------------------------
    @Index()
    @Column({ name: 'project_id', type: 'uuid' })
    projectId: Project['id'];

    @ManyToOne(() => ProjectEntity, (proposal) => proposal.analyses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: ProjectEntity;

    // ------------------------------------------------------------------

    @Column({
        name: 'master_image_id', 
        nullable: true, 
        type: 'uuid', 
    })
    masterImageId: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
    masterImage: MasterImageEntity;
}
