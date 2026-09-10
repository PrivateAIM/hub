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
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { MasterImageGroup } from '@privateaim/core-kit';

@Entity({ name: 'master_image_groups' })
export class MasterImageGroupEntity implements MasterImageGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 128 })
    name: string;

    @Index()
    @Column({ type: 'varchar', length: 512 })
    path: string;

    @Index()
    @Column({
        name: 'virtual_path', 
        type: 'varchar', 
        length: 512, 
    })
    virtualPath: string;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
