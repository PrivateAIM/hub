/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProcessStatus } from '@privateaim/kit';
import { bigintNumberTransformer, dateToISOStringTransformer, serializedTextTransformer } from '@privateaim/server-db-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { MasterImage, MasterImageCommandArgument  } from '@privateaim/core-kit';

@Entity({ name: 'master_images' })
export class MasterImageEntity implements MasterImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
        name: 'build_size',
        type: 'bigint',
        unsigned: true,
        nullable: true,
        default: null,
        transformer: bigintNumberTransformer,
    })
    buildSize: number | null;

    @Index()
    @Column({
        type: 'varchar',
        nullable: true,
        length: 512,
    })
    path: string | null;

    @Index()
    @Column({
        name: 'virtual_path', 
        type: 'varchar', 
        length: 512, 
    })
    virtualPath: string;

    @Index()
    @Column({
        name: 'group_virtual_path', 
        type: 'varchar', 
        length: 512, 
    })
    groupVirtualPath: string;

    @Index()
    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'text', nullable: true })
    command: string | null;

    @Column({
        name: 'command_arguments',
        type: 'text',
        nullable: true,
        transformer: serializedTextTransformer,
    })
    commandArguments: MasterImageCommandArgument[] | null;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
