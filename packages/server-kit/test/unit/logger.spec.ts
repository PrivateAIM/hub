/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { createLogger } from 'winston';
import { LoggerMemoryTransport } from '../../src';
import { CustomError } from '../data/error';

describe('src/logger', () => {
    it('should log simple message', () => {
        const memoryTransport = new LoggerMemoryTransport();

        const logger = createLogger({
            transports: [
                memoryTransport,
            ],
        });

        logger.info('This is a log message', {
            foo: 'bar',
        });

        const [item] = memoryTransport.items;
        expect(item).toBeDefined();
        expect(item.message).toEqual('This is a log message');
        expect(item.foo).toEqual('bar');
    });

    it('should log error', () => {
        const memoryTransport = new LoggerMemoryTransport();

        const logger = createLogger({
            transports: [
                memoryTransport,
            ],
        });

        const error = new CustomError('This is a log message');
        logger.info({
            message: error,
            foo: 'bar',
        });

        const [item] = memoryTransport.items;
        expect(item).toBeDefined();

        expect(item.message?.message).toEqual(error.message);
        expect(item.message?.stack).toEqual(error.stack);
        expect(item.message?.code).toEqual(error.code);

        expect(item.foo).toEqual('bar');
        expect(item.code).toBeUndefined();
    });
});
