/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { RegistryHookValidator } from '../../../../src/components';

describe('src/components/registry/hook', () => {
    it('should validate hook schema', async () => {
        const payload = {
            type: 'PUSH_ARTIFACT',
            occur_at: 1586922308,
            operator: 'admin',
            event_data: {
                resources: [
                    {
                        digest: 'sha256:8a9e9863dbb6e10edb5adfe917c00da84e1700fa76e7ed02476aa6e6fb8ee0d8',
                        tag: 'latest',
                        resource_url: 'hub.harbor.com/test-webhook/debian:latest',
                    },
                ],
                repository: {
                    date_created: 1586922308,
                    name: 'debian',
                    namespace: 'test-webhook',
                    repo_full_name: 'test-webhook/debian',
                    repo_type: 'private',
                },
            },
        };

        const validator = new RegistryHookValidator();

        const output = await validator.run(payload);
        expect(output.type).toEqual('PUSH_ARTIFACT');
        expect(output.operator).toEqual('admin');
        expect(output.event_data.repository.name).toEqual('debian');
    });
});
