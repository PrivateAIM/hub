/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { describe, expect, it } from 'vitest';
import { registrySchema } from '../../../../src/core/entities/registry/schema.ts';
import { registryProjectSchema } from '../../../../src/core/entities/registry-project/schema.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';

const fieldNames = (input: Parameters<typeof decodeQuery>[0], schema: Parameters<typeof decodeQuery>[1]['schema']) => decodeQuery(input, { schema })
    .fields
    .value
    .map((field) => field.name);

describe('decodeQuery: secret fields stay on their own resource', () => {
    it.each([
        // Registered schema NAMES: the schema objects are invariant in their
        // record type, so a mixed table of them does not type-check.
        ['registry-project → registry', DomainType.REGISTRY_PROJECT, 'include=registry&fields[registry]=%2BaccountSecret'],
        ['node → registry-project', DomainType.NODE, 'include=registryProject&fields[registryProject]=%2BaccountSecret'],
        ['project-node → node → registry-project', DomainType.PROJECT_NODE, 'include=node.registryProject&fields[node.registryProject]=%2BaccountSecret'],
    ])('drops it through %s', (_label, schema, input) => {
        expect(fieldNames(input, schema).filter((name) => name.endsWith('accountSecret'))).toEqual([]);
    });

    // Negative control: the root secret is left to its service gate.
    it('keeps it at the root of its own resource', () => {
        expect(fieldNames('fields=%2BaccountSecret', registrySchema)).toContain('accountSecret');
        expect(fieldNames('fields=%2BaccountSecret', registryProjectSchema)).toContain('accountSecret');
    });
});
