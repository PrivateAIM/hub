/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    MasterImage,
    Project, Registry, RegistryProject,
    Node,
    Analysis,
    AnalysisBuildStatus,
    AnalysisFile,
    AnalysisResultStatus,
    AnalysisRunStatus,
    UserSecret,
} from '@personalhealthtrain/core';
import {
    AnalysisConfigurationStatus, TrainType,
} from '@personalhealthtrain/core';
import type { Realm, User } from '@authup/core';
import { ProposalEntity } from '../proposal/entity';
import { MasterImageEntity } from '../master-image/entity';
import { TrainFileEntity } from '../train-file/entity';
import { UserSecretEntity } from '../user-secret/entity';
import { RegistryEntity } from '../registry/entity';
import { RegistryProjectEntity } from '../registry-project/entity';

@Entity()
export class TrainEntity implements Analysis {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 64, default: TrainType.ANALYSE })
        type: TrainType;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: true })
        name: string;

    @Column({ nullable: true, type: 'text' })
        query: string;

    @Column({ nullable: true, type: 'text' })
        hash: string;

    @Column({ nullable: true, type: 'text' })
        hash_signed: string;

    @Column({ nullable: true })
        session_id: string;

    @Column({ nullable: true })
        entrypoint_file_id: AnalysisFile['id'];

    @OneToOne(() => TrainFileEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'entrypoint_file_id' })
        entrypoint_file: TrainFileEntity;

    @Column({ type: 'int', unsigned: true, default: 0 })
        nodes: number;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        type: 'varchar', length: 64, nullable: true, default: null,
    })
        configuration_status: AnalysisConfigurationStatus | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        type: 'varchar', length: 64, nullable: true, default: null,
    })
        build_status: AnalysisBuildStatus | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        type: 'varchar', length: 64, nullable: true, default: null,
    })
        run_status: AnalysisRunStatus | null;

    @Column({
        type: 'uuid', nullable: true, default: null,
    })
        run_station_id: Node['id'] | null;

    @Column({
        type: 'integer', unsigned: true, nullable: true, default: null,
    })
        run_station_index: number | null;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar', length: 64, default: null,
    })
        result_status: AnalysisResultStatus | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        incoming_registry_project_id: RegistryProject['id'] | null;

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'incoming_registry_project_id' })
        incoming_registry_project: RegistryProjectEntity | null;

    @Column({ nullable: true })
        outgoing_registry_project_id: RegistryProject['id'] | null;

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'outgoing_registry_project_id' })
        outgoing_registry_project: RegistryProjectEntity | null;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        registry_id: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_id' })
        registry: RegistryEntity | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        user_rsa_secret_id: UserSecret['id'] | null;

    @ManyToOne(() => UserSecretEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_rsa_secret_id' })
        user_rsa_secret: UserSecretEntity | null;

    @Column({ nullable: true, type: 'uuid' })
        user_paillier_secret_id: UserSecret['id'] | null;

    @ManyToOne(() => UserSecretEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_paillier_secret_id' })
        user_paillier_secret_: UserSecretEntity | null;

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        user_id: User['id'];

    // ------------------------------------------------------------------
    @Column({ type: 'uuid' })
        project_id: Project['id'];

    @ManyToOne(() => ProposalEntity, (proposal) => proposal.analyses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
        project: ProposalEntity;

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity;

    // ------------------------------------------------------------------

    @BeforeInsert()
    @BeforeUpdate()
    setConfigurationStatus() {
        this.configuration_status = null;

        if (this.nodes > 0) {
            this.configuration_status = AnalysisConfigurationStatus.BASE_CONFIGURED;
        } else {
            return;
        }

        if (this.user_rsa_secret_id) {
            this.configuration_status = AnalysisConfigurationStatus.SECURITY_CONFIGURED;
        } else {
            return;
        }

        if (this.entrypoint_file_id) {
            this.configuration_status = AnalysisConfigurationStatus.RESOURCE_CONFIGURED;
        } else {
            return;
        }

        if (this.hash) {
            this.configuration_status = AnalysisConfigurationStatus.HASH_GENERATED;
        } else {
            return;
        }

        if (this.hash_signed) {
            this.configuration_status = AnalysisConfigurationStatus.HASH_SIGNED;
        } else {
            return;
        }

        // check if all conditions are met
        this.configuration_status = AnalysisConfigurationStatus.FINISHED;
    }
}
