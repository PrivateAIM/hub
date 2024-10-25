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
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    MasterImageEventLog,
} from '@privateaim/core-kit';

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

    @CreateDateColumn()
        expires_at: Date;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
