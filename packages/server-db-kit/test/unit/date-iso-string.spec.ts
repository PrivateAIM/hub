import { describe, expect, it } from 'vitest';
import { dateToISOStringTransformer } from '../../src/transformer/date-iso-string.ts';

describe('dateToISOStringTransformer', () => {
    it('from() converts a Date to an ISO-8601 string', () => {
        const date = new Date('2026-06-23T15:37:03.000Z');
        expect(dateToISOStringTransformer.from(date)).toBe('2026-06-23T15:37:03.000Z');
    });

    it('from() passes an existing string through unchanged', () => {
        expect(dateToISOStringTransformer.from('2026-06-23T15:37:03.000Z')).toBe('2026-06-23T15:37:03.000Z');
    });

    it('from() passes null / undefined through unchanged', () => {
        expect(dateToISOStringTransformer.from(null)).toBeNull();
        expect(dateToISOStringTransformer.from(undefined)).toBeUndefined();
    });

    it('to() passes the value through unchanged (write path)', () => {
        const date = new Date('2026-06-23T15:37:03.000Z');
        expect(dateToISOStringTransformer.to(date)).toBe(date);
        expect(dateToISOStringTransformer.to('2026-06-23T15:37:03.000Z')).toBe('2026-06-23T15:37:03.000Z');
        expect(dateToISOStringTransformer.to(null)).toBeNull();
    });
});
