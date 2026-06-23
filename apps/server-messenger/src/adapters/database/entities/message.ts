/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { deserialize, serialize } from '@authup/kit';
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
 * Pulls are ordered by `created_at` (relative ordering is timezone-independent) and
 * scoped to `recipient_id`; `data` is opaque to the hub (base64 E2E ciphertext for
 * analysis messaging). `expires_at` is an absolute datetime used by the TTL sweep.
 */
@Index(['recipient_id', 'created_at', 'id'])
@Index(['expires_at'])
@Entity({ name: 'messages' })
export class MessageEntity implements Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 64 })
    sender_type!: Message['sender_type'];

    @Column({ type: 'uuid' })
    sender_id!: string;

    @Column({ type: 'varchar', length: 64 })
    recipient_type!: Message['recipient_type'];

    @Column({ type: 'uuid' })
    recipient_id!: string;

    @Column({
        type: 'text',
        nullable: true,
        transformer: {
            to: (value: MessageData): string => serialize(value),
            from: (value: string | null): MessageData => deserialize<MessageData>(value),
        },
    })
    data!: MessageData;

    @Column({
        type: 'text',
        nullable: true,
        transformer: {
            to: (value: MessageMetadata | null): string => serialize(value),
            from: (value: string | null): MessageMetadata | null => deserialize<MessageMetadata | null>(value),
        },
    })
    metadata!: MessageMetadata | null;

    @CreateDateColumn()
    created_at!: Date;

    /** absolute expiry timestamp; the TTL sweep deletes rows past it */
    @Column({ type: Date })
    expires_at!: Date;
}
