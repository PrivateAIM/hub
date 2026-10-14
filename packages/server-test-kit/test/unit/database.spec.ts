/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { buildSuiteDatabaseName } from '../../src/database/index.ts';

describe('database', () => {
    it('should give each suite its own database on a shared server', () => {
        expect(buildSuiteDatabaseName('app', 'core')).toEqual('app_core');
        expect(buildSuiteDatabaseName('app', 'telemetry')).not.toEqual(buildSuiteDatabaseName('app', 'core'));
    });

    it('should reject a suite name that is not a safe database name segment', () => {
        expect(() => buildSuiteDatabaseName('app', 'core; DROP DATABASE app')).toThrow(SyntaxError);
        expect(() => buildSuiteDatabaseName('app', '')).toThrow(SyntaxError);
        expect(() => buildSuiteDatabaseName('app', 'Core')).toThrow(SyntaxError);
    });
});
