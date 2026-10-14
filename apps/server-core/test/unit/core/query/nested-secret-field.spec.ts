/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { BadRequestError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { registrySchema } from '../../../../src/core/entities/registry/schema.ts';
import { registryProjectSchema } from '../../../../src/core/entities/registry-project/schema.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';

describe('decodeQuery: nested secret fields', () => {
    it.each([
        // Registered schema NAMES: the schema objects are invariant in their
        // record type, so a mixed table of them does not type-check.
        ['registry-project → registry', DomainType.REGISTRY_PROJECT, 'include=registry&fields[registry]=%2BaccountSecret'],
        ['node → registry', DomainType.NODE, 'include=registry&fields[registry]=%2BaccountSecret'],
        ['node → registry-project', DomainType.NODE, 'include=registryProject&fields[registryProject]=%2BaccountSecret'],
        ['project-node → node → registry-project', DomainType.PROJECT_NODE, 'include=node.registryProject&fields[node.registryProject]=%2BaccountSecret'],
        ['analysis-node → node → registry', DomainType.ANALYSIS_NODE, 'include=node.registry&fields[node.registry]=%2BaccountSecret'],
    ])('refuses %s', (_label, schema, input) => {
        expect(() => decodeQuery(input, { schema })).toThrow(BadRequestError);
    });

    it('refuses the record-shaped input too', () => {
        expect(() => decodeQuery(
            { include: 'registry', fields: { registry: '+accountSecret' } },
            { schema: registryProjectSchema },
        )).toThrow(BadRequestError);
    });

    // Negative controls: the root secret is left to its service gate, and a
    // relation without the secret decodes as before.
    it('leaves the root secret to its own resource', () => {
        expect(() => decodeQuery('fields=%2BaccountSecret', { schema: registrySchema })).not.toThrow();
        expect(() => decodeQuery('fields=%2BaccountSecret', { schema: registryProjectSchema })).not.toThrow();
    });

    it('decodes a relation without the secret', () => {
        const query = decodeQuery('include=registry', { schema: registryProjectSchema });

        const names = query.fields.value.map((field) => field.name);
        expect(names).toContain('registry.accountName');
        expect(names).not.toContain('registry.accountSecret');
    });
});
