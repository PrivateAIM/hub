/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer, serializedTextTransformer } from '@privateaim/server-db-kit';
import type { Message, MessageData, MessageMetadata } from '@privateaim/messenger-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * The durable mailbox. Append-only: one row per recipient, delivered delete-on-ack.
 * Pulls are ordered by `createdAt` (relative ordering is timezone-independent) and
 * scoped to `recipientId`; `data` is opaque to the hub (base64 E2E ciphertext for
 * analysis messaging). `expiresAt` is an absolute datetime used by the TTL sweep.
 */
@Index(['recipientId', 'createdAt', 'id'])
@Index(['expiresAt'])
@Entity({ name: 'messages' })
export class MessageEntity implements Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'sender_type', 
        type: 'varchar', 
        length: 64, 
    })
    senderType!: Message['senderType'];

    @Column({ name: 'sender_id', type: 'uuid' })
    senderId!: string;

    @Column({
        name: 'recipient_type', 
        type: 'varchar', 
        length: 64, 
    })
    recipientType!: Message['recipientType'];

    @Column({ name: 'recipient_id', type: 'uuid' })
    recipientId!: string;

    @Column({
        type: 'text',
        nullable: true,
        transformer: serializedTextTransformer,
    })
    data!: MessageData;

    @Column({
        type: 'text',
        nullable: true,
        transformer: serializedTextTransformer,
    })
    metadata!: MessageMetadata | null;

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt!: string;

    /** absolute expiry timestamp; the TTL sweep deletes rows past it */
    @Column({
        name: 'expires_at', 
        type: Date, 
        transformer: dateToISOStringTransformer, 
    })
    expiresAt!: string;
}
