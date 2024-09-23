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
    Entity, Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { MasterImageGroup } from '@privateaim/core-kit';

@Entity({ name: 'master_image_groups' })
export class MasterImageGroupEntity implements MasterImageGroup {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'varchar', length: 512 })
        path: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 256 })
        virtual_path: string;

    @Column({ type: 'text', nullable: true })
        command: string | null;

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
        command_arguments: unknown | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
