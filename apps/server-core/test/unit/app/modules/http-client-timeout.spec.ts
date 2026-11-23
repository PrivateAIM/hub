/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import { HTTPClientTimeout } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { createBasicHarborAPIClient } from '../../../../src/app/components/registry/handlers/utils.ts';
import { ConfigInjectionKey } from '../../../../src/app/modules/config/index.ts';
import { normalizeConfig } from '../../../../src/app/modules/config/normalize.ts';
import { TelemetryClientInjectionKey, TelemetryClientModule } from '../../../../src/app/modules/telemetry-client/index.ts';

describe('outbound client timeouts', () => {
    it('should bound the telemetry client', async () => {
        const container = new Container();

        container.register(ConfigInjectionKey, { useValue: await normalizeConfig({ telemetryURL: 'http://telemetry.test/' }) });
        await new TelemetryClientModule().setup(container);

        expect(container.resolve(TelemetryClientInjectionKey).toOptions().timeout).toBe(HTTPClientTimeout.SERVICE);
    });

    it('should bound the harbor client', () => {
        const client = createBasicHarborAPIClient('admin:start123@http://harbor.test/api/v2.0/');

        expect(client.toOptions().timeout).toBe(HTTPClientTimeout.HARBOR);
        expect(client.getBaseURL()).toBe('http://harbor.test/api/v2.0/');
    });
});
