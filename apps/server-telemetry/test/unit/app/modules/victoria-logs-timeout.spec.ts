/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import { HTTPClientTimeout } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { ConfigInjectionKey } from '../../../../src/app/modules/config/index.ts';
import { normalizeConfig } from '../../../../src/app/modules/config/normalize.ts';
import { VictoriaLogsClientInjectionKey, VictoriaLogsModule } from '../../../../src/app/modules/victoria-logs/index.ts';

describe('VictoriaLogsModule', () => {
    it.each([
        [{ victoriaLogsURL: 'http://victoria.test/' }],
        [{ victoriaLogsIngestorURL: 'http://ingestor.test/', victoriaLogsQuerierURL: 'http://querier.test/' }],
    ])('should bound every request of the client (%o)', async (input) => {
        const container = new Container();

        container.register(ConfigInjectionKey, { useValue: await normalizeConfig(input) });
        await new VictoriaLogsModule().setup(container);

        expect(container.resolve(VictoriaLogsClientInjectionKey).toOptions().timeout).toBe(HTTPClientTimeout.VICTORIA_LOGS);
    });
});
