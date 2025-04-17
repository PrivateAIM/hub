/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { deserialize, serialize } from '@authup/kit';
import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    MasterImage,
    MasterImageEventLog,
} from '@privateaim/core-kit';
import { MasterImageEntity } from '../master-image';

@Entity({ name: 'master_image_event_logs' })
export class MasterImageEventLogEntity implements MasterImageEventLog {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64 })
        name: string;

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
        data: unknown | null;

    // ------------------------------------------------------------------

    @Column({ type: 'boolean', default: false })
        expiring: boolean;

    @Column({
        type: 'varchar',
        length: 28,
    })
        expires_at: string;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
