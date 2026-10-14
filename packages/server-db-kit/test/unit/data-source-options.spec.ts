/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OptionsError } from 'typeorm-extension';
import { describe, expect, it } from 'vitest';
import { DataSourceOptionsBuilder } from '../../src/data-source/options.ts';

describe('DataSourceOptionsBuilder (timezone pin)', () => {
    it('pins a postgres session, reader and Date writer to UTC', () => {
        const options = new DataSourceOptionsBuilder().buildWith({ type: 'postgres' });

        expect(options).toMatchObject({ extra: { options: expect.stringContaining('TimeZone=UTC') } });
    });

    it('pins a mysql session, reader and Date writer to UTC', () => {
        const options = new DataSourceOptionsBuilder().buildWith({ type: 'mysql' });

        expect(options).toMatchObject({ timezone: 'Z', dateStrings: ['DATE'] });
    });

    it('leaves better-sqlite3 as configured', () => {
        const options = new DataSourceOptionsBuilder().buildWith({ type: 'better-sqlite3', database: ':memory:' });

        expect(options).not.toHaveProperty('timezone');
        expect(options).not.toHaveProperty('extra');
    });

    it('refuses a setting that contradicts the pin instead of half applying it', () => {
        expect(() => new DataSourceOptionsBuilder().buildWith({ type: 'mysql', timezone: '+02:00' })).toThrow(OptionsError);
        expect(() => new DataSourceOptionsBuilder().buildWith({
            type: 'postgres',
            extra: { options: '-c TimeZone=Europe/Berlin' },
        })).toThrow(OptionsError);
    });

    it('accepts options it already pinned (the CLI rebuilds from built options)', () => {
        const builder = new DataSourceOptionsBuilder();

        expect(() => builder.buildWith(builder.buildWith({ type: 'postgres' }))).not.toThrow();
        expect(() => builder.buildWith(builder.buildWith({ type: 'mysql' }))).not.toThrow();
    });
});
