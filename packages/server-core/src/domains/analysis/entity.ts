/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core-kit';
import type {
    Analysis,
    AnalysisRunStatus,
    MasterImage, MasterImageCommandArgument,
    Project,
    Registry,
} from '@privateaim/core-kit';
import {
    AnalysisBuildStatus,
} from '@privateaim/core-kit';
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
import { deserialize, serialize } from '@authup/kit';
import { MasterImageEntity } from '../master-image/entity';
import { ProjectEntity } from '../project/entity';
import { RegistryEntity } from '../registry/entity';

@Entity()
export class AnalysisEntity implements Analysis {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: true })
        name: string;

    @Column({ type: 'text', nullable: true })
        description: string | null;

    @Column({ type: 'int', unsigned: true, default: 0 })
        nodes: number;

    // ------------------------------------------------------------------

    @Column({ type: 'boolean', default: false })
        configuration_locked: boolean;

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
        type: 'text',
        nullable: true,
        transformer: {
            to(value: any): any {
                return serialize(value);
            },
            from(value: any): any {
                return deserialize(value);
            },
        },
    })
        image_command_arguments: MasterImageCommandArgument[] | null;

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
}
