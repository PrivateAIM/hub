/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import type { Realm } from '@authup/core-kit';
import { deserialize, serialize } from '@authup/kit';
import type { ObjectLiteral } from '@privateaim/kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    Event,
} from '@privateaim/telemetry-kit';

@Index(['name', 'scope'])
@Index(['refType', 'refId'])
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
    @Column({
        name: 'ref_type', 
        type: 'varchar', 
        length: 64, 
    })
    refType: string;

    @Index()
    @Column({
        name: 'ref_id',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    refId: string | null;

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
    @Column({
        name: 'request_path',
        type: 'varchar',
        length: 256,
        nullable: true,
    })
    requestPath: string | null;

    @Index()
    @Column({
        name: 'request_method',
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    requestMethod: string | null;

    @Index()
    @Column({
        name: 'request_ip_address',
        type: 'varchar',
        length: 15,
        nullable: true,
    })
    requestIpAddress: string | null;

    @Index()
    @Column({
        name: 'request_user_agent',
        type: 'varchar',
        length: 512,
        nullable: true,
    })
    requestUserAgent: string | null;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'actor_type',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    actorType: string | null;

    @Index()
    @Column({
        name: 'actor_id', 
        type: 'uuid', 
        nullable: true, 
    })
    actorId: string | null;

    @Index()
    @Column({
        name: 'actor_name',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    actorName: string | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'realm_id', 
        type: 'uuid', 
        nullable: true, 
    })
    realmId: Realm['id'] | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'expires_at',
        type: 'varchar',
        length: 28,
        nullable: true,
    })
    expiresAt: string | null;

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
