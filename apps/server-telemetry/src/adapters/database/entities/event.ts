/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer, serializedTextTransformer } from '@privateaim/server-db-kit';
import type { Realm } from '@authup/core-kit';
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
    EventScope,
} from '@privateaim/telemetry-kit';

// Read path: the admin list filters realmId in [realm, null] and orders by
// createdAt; the retention sweep matches expiring + expiresAt. Every
// filterable key of `eventSchema` leads one of these or its own single, and
// the bare `sort=-createdAt` (no realm filter) rides the createdAt single —
// (realm_id, created_at) cannot serve it, realm_id leads that key (#1842).
// Nothing under request_*/actor_* is filterable or sortable at all — those
// ten single-column indexes were pure write cost on a write-mostly table.
@Index(['name', 'scope'])
@Index(['refType', 'refId'])
@Index(['realmId', 'createdAt'])
@Index(['expiring', 'expiresAt'])
@Entity({ name: 'events' })
export class EventEntity implements Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
    scope: `${EventScope}`;

    @Column({ type: 'varchar', length: 64 })
    name: string;

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
        transformer: serializedTextTransformer,
    })
    data: ObjectLiteral | null;

    // ------------------------------------------------------------------

    @Column({ type: 'boolean', default: false })
    expiring: boolean;

    // ------------------------------------------------------------------

    @Column({
        name: 'request_path',
        type: 'varchar',
        length: 256,
        nullable: true,
    })
    requestPath: string | null;

    @Column({
        name: 'request_method',
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    requestMethod: string | null;

    @Column({
        name: 'request_ip_address',
        type: 'varchar',
        length: 45,
        nullable: true,
    })
    requestIpAddress: string | null;

    @Column({
        name: 'request_user_agent',
        type: 'varchar',
        length: 512,
        nullable: true,
    })
    requestUserAgent: string | null;

    // ------------------------------------------------------------------

    @Column({
        name: 'actor_type',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    actorType: string | null;

    @Column({
        name: 'actor_id', 
        type: 'uuid', 
        nullable: true, 
    })
    actorId: string | null;

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

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
