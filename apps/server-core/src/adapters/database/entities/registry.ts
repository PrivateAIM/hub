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
    PrimaryGeneratedColumn, 
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Registry } from '@privateaim/core-kit';

@Unique(['name'])
@Unique(['host'])
@Entity({ name: 'registries' })
export class RegistryEntity implements Registry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 128 })
    name: string;

    @Column({ type: 'varchar', length: 512 })
    host: string;

    // ------------------------------------------------------------------

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

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
