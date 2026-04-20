/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { VictoriaLogsLogStore } from '../../src/adapters/telemetry/victoria-logs.ts';

// Expose protected methods for testing
class TestableVictoriaLogsLogStore extends VictoriaLogsLogStore {
    constructor() {
        super(null as any); // no real client needed for query-building tests
    }

    testIsValidLabelKey(key: string): boolean {
        return this.isValidLabelKey(key);
    }

    testEscapeQueryValue(value: unknown): string {
        return this.escapeQueryValue(value);
    }

    testBuildQuery(labels: Record<string, any>, sort?: 'DESC' | 'ASC'): string {
        return this.buildQuery(labels, sort);
    }
}

describe('VictoriaLogsLogStore', () => {
    const store = new TestableVictoriaLogsLogStore();

    describe('isValidLabelKey', () => {
        it('should accept alphanumeric keys', () => {
            expect(store.testIsValidLabelKey('channel')).toBe(true);
            expect(store.testIsValidLabelKey('node_id')).toBe(true);
            expect(store.testIsValidLabelKey('Key123')).toBe(true);
            expect(store.testIsValidLabelKey('_private')).toBe(true);
        });

        it('should reject keys with special characters', () => {
            expect(store.testIsValidLabelKey('key with spaces')).toBe(false);
            expect(store.testIsValidLabelKey('key:value')).toBe(false);
            expect(store.testIsValidLabelKey('key"injection')).toBe(false);
            expect(store.testIsValidLabelKey('key;drop')).toBe(false);
            expect(store.testIsValidLabelKey('')).toBe(false);
        });

        it('should reject keys starting with digits', () => {
            expect(store.testIsValidLabelKey('123key')).toBe(false);
            expect(store.testIsValidLabelKey('0abc')).toBe(false);
        });

        it('should reject query injection via key names', () => {
            expect(store.testIsValidLabelKey('key AND _msg:"injected"')).toBe(false);
            expect(store.testIsValidLabelKey('key | stats count()')).toBe(false);
            expect(store.testIsValidLabelKey('key\nAND')).toBe(false);
        });
    });

    describe('escapeQueryValue', () => {
        it('should pass through safe strings', () => {
            expect(store.testEscapeQueryValue('hello')).toBe('hello');
            expect(store.testEscapeQueryValue('node-123')).toBe('node-123');
        });

        it('should escape double quotes', () => {
            expect(store.testEscapeQueryValue('value"injection')).toBe('value\\"injection');
        });

        it('should escape backslashes', () => {
            expect(store.testEscapeQueryValue('path\\to\\file')).toBe('path\\\\to\\\\file');
        });

        it('should handle combined injection attempts', () => {
            expect(store.testEscapeQueryValue('" AND _msg:"injected')).toBe('\\" AND _msg:\\"injected');
        });

        it('should convert non-string values to strings', () => {
            expect(store.testEscapeQueryValue(42)).toBe('42');
            expect(store.testEscapeQueryValue(true)).toBe('true');
            expect(store.testEscapeQueryValue(null)).toBe('null');
        });
    });

    describe('buildQuery', () => {
        it('should build query with valid labels', () => {
            const query = store.testBuildQuery({ channel: 'system', level: 'error' });
            expect(query).toContain('channel:="system"');
            expect(query).toContain('level:="error"');
            expect(query).toContain(' AND ');
        });

        it('should return wildcard for empty labels', () => {
            const query = store.testBuildQuery({});
            expect(query).toMatch(/^\* \| sort by/);
        });

        it('should skip invalid label keys', () => {
            const query = store.testBuildQuery({
                valid_key: 'ok',
                'invalid key': 'injected',
                'key"quote': 'injected',
            });
            expect(query).toContain('valid_key:="ok"');
            expect(query).not.toContain('invalid key');
            expect(query).not.toContain('key"quote');
        });

        it('should escape values in query', () => {
            const query = store.testBuildQuery({ channel: 'value"with"quotes' });
            expect(query).toContain('channel:="value\\"with\\"quotes"');
        });

        it('should respect sort direction', () => {
            expect(store.testBuildQuery({}, 'ASC')).toContain('sort by (_time ASC)');
            expect(store.testBuildQuery({}, 'DESC')).toContain('sort by (_time DESC)');
        });

        it('should default to DESC sort', () => {
            expect(store.testBuildQuery({})).toContain('sort by (_time DESC)');
        });
    });
});
