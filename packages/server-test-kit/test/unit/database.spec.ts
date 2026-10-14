/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach, 
    beforeEach, 
    describe, 
    expect, 
    it,
} from 'vitest';
import {
    buildSuiteDatabaseName,
    isServerDatabaseType,
    readDatabaseConnectionEnv,
} from '../../src/database/index.ts';

const DB_KEYS = ['DB_TYPE', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'] as const;

describe('database', () => {
    let snapshot: Partial<Record<typeof DB_KEYS[number], string>>;

    beforeEach(() => {
        snapshot = {};
        for (const key of DB_KEYS) {
            snapshot[key] = process.env[key];
            delete process.env[key];
        }
    });

    afterEach(() => {
        for (const key of DB_KEYS) {
            if (typeof snapshot[key] === 'string') {
                process.env[key] = snapshot[key];
            } else {
                delete process.env[key];
            }
        }
    });

    it('should give each suite its own database on a shared server', () => {
        expect(buildSuiteDatabaseName('app', 'core')).toEqual('app_core');
        expect(buildSuiteDatabaseName('app', 'telemetry')).not.toEqual(buildSuiteDatabaseName('app', 'core'));
    });

    it('should fall back to app as the base name', () => {
        expect(buildSuiteDatabaseName(undefined, 'storage')).toEqual('app_storage');
        expect(buildSuiteDatabaseName('', 'storage')).toEqual('app_storage');
    });

    it('should reject a suite name that is not a safe database name segment', () => {
        expect(() => buildSuiteDatabaseName('app', 'core; DROP DATABASE app')).toThrow(SyntaxError);
        expect(() => buildSuiteDatabaseName('app', '')).toThrow(SyntaxError);
        expect(() => buildSuiteDatabaseName('app', 'Core')).toThrow(SyntaxError);
    });

    it('should only treat mysql and postgres as shared servers', () => {
        expect(isServerDatabaseType('mysql')).toBe(true);
        expect(isServerDatabaseType('postgres')).toBe(true);
        expect(isServerDatabaseType('better-sqlite3')).toBe(false);
        expect(isServerDatabaseType(undefined)).toBe(false);
    });

    it('should read a server connection from the environment', () => {
        process.env.DB_TYPE = 'mysql';
        process.env.DB_HOST = 'db.test';
        process.env.DB_PASSWORD = 'secret';
        process.env.DB_DATABASE = 'app';

        expect(readDatabaseConnectionEnv()).toEqual({
            type: 'mysql',
            host: 'db.test',
            port: 3306,
            username: 'root',
            password: 'secret',
            database: 'app',
        });
    });

    it('should read no server connection for sqlite', () => {
        process.env.DB_TYPE = 'better-sqlite3';
        process.env.DB_DATABASE = ':memory:';

        expect(readDatabaseConnectionEnv()).toBeUndefined();
    });
});
