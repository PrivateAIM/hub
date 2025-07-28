/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { deserialize, serialize } from '@authup/kit';
import { ObjectLiteral } from '@privateaim/server-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    Event,
} from '@privateaim/core-kit';

@Entity({ name: 'events' })
export class EventEntity<T extends ObjectLiteral = ObjectLiteral> implements Event<T> {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64 })
        scope: string;

    @Column({ type: 'varchar', length: 64 })
        name: string;

    @Column({ type: 'varchar', length: 64 })
        ref_type: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
        ref_id: string | null;

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
        data: T | null;

    @Column({ type: 'boolean', default: false })
        expiring: boolean;

    // ------------------------------------------------------------------

    @Column({ type: 'varchar', length: 64, nullable: true })
        actor_type: string | null;

    @Column({ type: 'uuid', nullable: true })
        actor_id: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
        actor_name: string | null;

    @Column({ type: 'varchar', length: 15, nullable: true })
        actor_ip_address: string | null;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar',
        length: 28,
        nullable: true,
    })
        expires_at: string | null;

    @CreateDateColumn()
        created_at: string;

    @UpdateDateColumn()
        updated_at: string;
}
