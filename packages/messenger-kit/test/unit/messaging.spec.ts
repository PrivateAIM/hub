/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { buildErrorMessageForAttribute } from 'validup';
import type { CTSMessagingMessage } from '../../src';
import { CTSMessagingMessageValidator } from '../../src';

describe('messaging > validator', () => {
    it('should validate message', async () => {
        const validator = new CTSMessagingMessageValidator();

        const message : CTSMessagingMessage = {
            data: {},
            to: [
                { type: 'user', id: '92b27b20-4c24-4897-ac68-daba7f306a08' },
            ],
        };

        const output = await validator.run(message);
        expect(output).toBeDefined();
    });

    it('should validate message with string data', async () => {
        const validator = new CTSMessagingMessageValidator();

        const message : CTSMessagingMessage = {
            data: 'xxx',
            to: [
                { type: 'user', id: '92b27b20-4c24-4897-ac68-daba7f306a08' },
            ],
        };

        const output = await validator.run(message);
        expect(output).toBeDefined();
    });

    it('should not validate message due invalid recipient format (type)', async () => {
        const validator = new CTSMessagingMessageValidator();

        const message : CTSMessagingMessage = {
            data: 'xxx',
            to: [
                { type: 'boxer' as 'user', id: '92b27b20-4c24-4897-ac68-daba7f306a08' },
            ],
        };

        await expect(validator.run(message)).rejects.toThrow(buildErrorMessageForAttribute('to'));
    });

    it('should not validate message due invalid recipient format (id)', async () => {
        const validator = new CTSMessagingMessageValidator();

        const message : CTSMessagingMessage = {
            data: 'xxx',
            to: [
                { type: 'user', id: '1' },
            ],
        };

        await expect(validator.run(message)).rejects.toThrow(buildErrorMessageForAttribute('to'));
    });
});
