/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import { deserialize, serialize } from '@authup/kit';
import { ObjectLiteral } from '@privateaim/kit';
import {
    Column,
    CreateDateColumn,
    Entity, Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    Event,
} from '@privateaim/telemetry-kit';

@Index(['name', 'scope'])
@Index(['ref_type', 'ref_id'])
@Entity({ name: 'events' })
export class EventEntity implements Event {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
        scope: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
        name: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
        ref_type: string;

    @Index()
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
        data: ObjectLiteral | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({ type: 'boolean', default: false })
        expiring: boolean;

    // ------------------------------------------------------------------

    @Index()
    @Column({ type: 'varchar', length: 256, nullable: true })
        request_path: string | null;

    @Index()
    @Column({ type: 'varchar', length: 10, nullable: true })
        request_method: string | null;

    @Index()
    @Column({ type: 'varchar', length: 15, nullable: true })
        request_ip_address: string | null;

    @Index()
    @Column({ type: 'varchar', length: 512, nullable: true })
        request_user_agent: string | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        actor_type: string | null;

    @Index()
    @Column({ type: 'uuid', nullable: true })
        actor_id: string | null;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        actor_name: string | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        realm_id: Realm['id'] | null;

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
