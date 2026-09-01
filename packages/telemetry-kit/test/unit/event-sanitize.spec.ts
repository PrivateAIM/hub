/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { EventValidator, sanitizeEventData } from '../../src/domains/event/validator';

describe('sanitizeEventData', () => {
    it('should drop credential-named diff keys', () => {
        expect(sanitizeEventData({
            diff: {
                name: { next: 'b', previous: 'a' },
                accountSecret: { next: 's', previous: null },
            },
        })).toEqual({ diff: { name: { next: 'b', previous: 'a' } } });
    });

    it('should drop a diff entry whose previous value is absent', () => {
        // That is the signature of a `select: false` column: present in the
        // save payload, missing from the database pre-image.
        expect(sanitizeEventData({
            diff: {
                token: { next: 't', previous: 'u' },
                other: { next: 'x' },
            },
        })).toEqual({ diff: {} });
    });

    it('should fail closed on a non-object and preserve the empty bag', () => {
        expect(sanitizeEventData('not-an-object')).toBeNull();
        // The entity-event bridge persists `{}` on create/delete — unchanged.
        expect(sanitizeEventData({})).toEqual({});
    });
});

describe('EventValidator client-controlled bounds', () => {
    const validator = new EventValidator();
    const base = {
        refType: 'project', 
        scope: 'entity', 
        name: 'created', 
    };

    // A bound that THROWS does not drop the field — EventComponentCreateHandler
    // catches, emits creationFailed and discards the whole row. These values come
    // straight off the request, so a crawler with a 600-char user agent could
    // erase every audit event it triggered.
    it.each([
        ['requestUserAgent', 600, 512],
        ['requestPath', 400, 256],
        ['actorName', 200, 64],
    ])('truncates an over-long %s instead of dropping the record', async (key, input, expected) => {
        const result: any = await validator.run({ ...base, [key]: 'x'.repeat(input) });

        expect(result[key]).toHaveLength(expected);
        expect(result.refType).toBe('project');
    });

    it('degrades an unparseable request ip instead of dropping the record', async () => {
        // getRequestIP(trustProxy: true) returns the leftmost X-Forwarded-For
        // entry verbatim, so this value is fully client-controlled.
        const result = await validator.run({ ...base, requestIpAddress: 'garbage' });

        expect(result.requestIpAddress).toBeNull();
        expect(result.refType).toBe('project');
    });

    it('still rejects producer-controlled vocabulary', async () => {
        await expect(validator.run({ ...base, scope: 'model' })).rejects.toThrow();
    });
});
