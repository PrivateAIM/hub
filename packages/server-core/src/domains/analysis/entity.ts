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
    Project,
    Registry,
    Analysis,
    AnalysisBuildStatus,
    AnalysisFile,
    AnalysisResultStatus,
    AnalysisRunStatus,
} from '@privateaim/core';
import {
    AnalysisConfigurationStatus,
} from '@privateaim/core';
import type { Realm, User } from '@authup/core';
import { ProjectEntity } from '../project/entity';
import { MasterImageEntity } from '../master-image/entity';
import { AnalysisFileEntity } from '../analysis-file/entity';
import { RegistryEntity } from '../registry/entity';

@Entity()
export class AnalysisEntity implements Analysis {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: true })
        name: string;

    @Column({ nullable: true })
        entrypoint_file_id: AnalysisFile['id'];

    @OneToOne(() => AnalysisFileEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'entrypoint_file_id' })
        entrypoint_file: AnalysisFileEntity;

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
        registry_id: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_id' })
        registry: RegistryEntity | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        user_id: User['id'];

    // ------------------------------------------------------------------
    @Column({ type: 'uuid' })
        project_id: Project['id'];

    @ManyToOne(() => ProjectEntity, (proposal) => proposal.analyses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
        project: ProjectEntity;

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

        if (this.entrypoint_file_id) {
            this.configuration_status = AnalysisConfigurationStatus.RESOURCE_CONFIGURED;
        } else {
            return;
        }

        // check if all conditions are met
        this.configuration_status = AnalysisConfigurationStatus.FINISHED;
    }
}
