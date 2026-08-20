/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Message, MessageParty } from '@privateaim/messenger-kit';
import type { DataSource, Repository } from 'typeorm';
import { In, Raw } from 'typeorm';
import { MessageEntity } from '../../../../../adapters/database/entities/message.ts';
import { MESSAGE_SWEEP_BATCH_SIZE } from '../../../../../core/entities/message/constants.ts';
import type {
    IMessageRepository,
    MessageDeleteExpiredOptions,
    MessagePersistInput,
} from '../../../../../core/entities/message/types.ts';

export class MessageRepositoryAdapter implements IMessageRepository {
    protected repository: Repository<MessageEntity>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(MessageEntity);
    }

    async createMany(input: MessagePersistInput[]): Promise<Message[]> {
        const entities = input.map((item) => this.repository.create(item));

        return this.repository.save(entities);
    }

    async findManyForRecipient(recipient: MessageParty, limit: number): Promise<Message[]> {
        // select only the public Message fields — `expiresAt` is internal (TTL)
        return this.repository.createQueryBuilder('message')
            .select([
                'message.id',
                'message.senderType',
                'message.senderId',
                'message.recipientType',
                'message.recipientId',
                'message.data',
                'message.metadata',
                'message.createdAt',
            ])
            .where('message.recipientType = :recipientType', { recipientType: recipient.type })
            .andWhere('message.recipientId = :recipientId', { recipientId: recipient.id })
            .orderBy('message.createdAt', 'ASC')
            .addOrderBy('message.id', 'ASC')
            .limit(limit)
            .getMany();
    }

    async ackByIds(recipient: MessageParty, ids: string[]): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        await this.repository.createQueryBuilder()
            .delete()
            .from(MessageEntity)
            .where('recipientType = :recipientType', { recipientType: recipient.type })
            .andWhere('recipientId = :recipientId', { recipientId: recipient.id })
            .andWhere('id IN (:...ids)', { ids })
            .execute();
    }

    async deleteExpired(now: Date, options: MessageDeleteExpiredOptions = {}): Promise<number> {
        // A non-positive or non-integral size must never reach `take`: typeorm
        // ignores a falsy one, which would silently restore the single
        // unbounded DELETE this batching exists to prevent, and the rest reach
        // the driver as invalid SQL. Fall back to the default instead.
        const requested = options.batchSize;
        const batchSize = typeof requested === 'number' &&
            Number.isSafeInteger(requested) &&
            requested > 0 ?
            requested :
            MESSAGE_SWEEP_BATCH_SIZE;

        let total = 0;

        for (;;) {
            // ids only: the row carries an opaque `data` payload behind a
            // deserialize transformer, and nothing but the id is needed here.
            const rows = await this.repository.find({
                select: { id: true },
                where: {
                    // Raw, not LessThan: the column is a datetime while the
                    // property is typed as an ISO string, and `now` must stay
                    // a bound Date. An ISO string would satisfy the property
                    // type but MySQL truncates the trailing `Z` when casting
                    // it to a datetime.
                    expiresAt: Raw((alias) => `${alias} < :now`, { now }),
                },
                take: batchSize,
            });

            if (rows.length === 0) {
                break;
            }

            const result = await this.repository.delete({ id: In(rows.map((row) => row.id)) });

            // A driver that does not report affected rows still made progress,
            // so count the batch rather than returning 0.
            total += result.affected ?? rows.length;

            // Another replica's sweep already owns these rows. Stop rather than
            // re-selecting them; the next tick picks up whatever is left.
            if (result.affected === 0) {
                break;
            }

            if (rows.length < batchSize) {
                break;
            }
        }

        return total;
    }
}
