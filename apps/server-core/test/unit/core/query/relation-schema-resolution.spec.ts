/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition, IFilters, IQuery } from '@rapiq/core';
import { isFilters } from '@rapiq/core';
import {
    describe,
    expect,
    it,
} from 'vitest';
import { analysisNodeSchema } from '../../../../src/core/entities/analysis-node/schema.ts';
import { projectNodeSchema } from '../../../../src/core/entities/project-node/schema.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';

// A junction schema (analysis-node, project-node) does not re-list the fields
// of its related entities in its own filter/sort allow-lists. Instead it maps
// each relation to the related schema via `schemaMapping`, and rapiq resolves a
// dotted key (`analysis.name`) by descending into the related schema's own
// allow-lists. These tests pin that resolution so the dotted entries stay gone.

function filterFields(query: IQuery): string[] {
    const out: string[] = [];
    const walk = (group: IFilters) => {
        for (const condition of group.value as ICondition[]) {
            if (isFilters(condition)) {
                walk(condition);
                continue;
            }
            out.push((condition as { field: string }).field);
        }
    };
    if (isFilters(query.filters)) {
        walk(query.filters);
    }
    return out;
}

const sortNames = (query: IQuery): string[] => query.sorts.value.map((s) => s.name);

describe('relation schema resolution', () => {
    describe('analysis-node', () => {
        it('resolves a related analysis filter through schemaMapping', () => {
            const query = decodeQuery(
                { filter: { 'analysis.name': 'foo' }, include: 'analysis' },
                { schema: analysisNodeSchema },
            );
            expect(filterFields(query)).toContain('analysis.name');
        });

        it('resolves a related node filter through schemaMapping', () => {
            const query = decodeQuery(
                { filter: { 'node.name': 'bar' }, include: 'node' },
                { schema: analysisNodeSchema },
            );
            expect(filterFields(query)).toContain('node.name');
        });

        it('resolves a related analysis sort through schemaMapping', () => {
            const query = decodeQuery(
                { sort: 'analysis.name', include: 'analysis' },
                { schema: analysisNodeSchema },
            );
            expect(sortNames(query)).toContain('analysis.name');
        });

        it('drops a related filter the target schema does not allow', () => {
            // `build_hash` is a column on analysis but not in analysisSchema.filters
            // — the related schema, not the junction, governs what is filterable.
            const query = decodeQuery(
                { filter: { 'analysis.build_hash': 'x' }, include: 'analysis' },
                { schema: analysisNodeSchema },
            );
            expect(filterFields(query)).not.toContain('analysis.build_hash');
        });

        it('still resolves the junction\'s own root filters', () => {
            const query = decodeQuery(
                { filter: { execution_status: 'running' } },
                { schema: analysisNodeSchema },
            );
            expect(filterFields(query)).toContain('execution_status');
        });
    });

    describe('project-node', () => {
        it('resolves a related project sort through schemaMapping', () => {
            const query = decodeQuery(
                { sort: 'project.name', include: 'project' },
                { schema: projectNodeSchema },
            );
            expect(sortNames(query)).toContain('project.name');
        });

        it('resolves a related project filter through schemaMapping', () => {
            const query = decodeQuery(
                { filter: { 'project.display_name': 'p' }, include: 'project' },
                { schema: projectNodeSchema },
            );
            expect(filterFields(query)).toContain('project.display_name');
        });
    });
});
