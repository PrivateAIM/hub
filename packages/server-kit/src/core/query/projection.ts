/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Field,
    FieldOperator,
    Fields,
    Query,
    isGroupedQuery,
} from '@rapiq/core';
import type { IQuery, Schema } from '@rapiq/core';
import type { ReadProjection } from './types.ts';

/**
 * The primary key. Every database read projects it, whatever the fieldset
 * (the repositories' `applyQuery`), so loading it for a check never widens
 * the response.
 */
const KEY_FIELD = 'id';

/**
 * The fields a read of the schema loads when it names none: its declared
 * defaults. A schema without defaults contributes none. Never the allowed
 * list, which also names gated fields (`select: false` secrets,
 * `createRootOnlyFieldsGate`) that no check may load.
 */
export function readDefaultFieldNames(schema: Schema<any>): string[] {
    return schema.fields.hasDefaults() ? [...schema.fields.default] : [];
}

/**
 * The root fields a per-row decision on rows of the schema reads: the
 * schema's defaults, the realm column and the key.
 */
export function buildCheckFields(schema: Schema<any>, realmAttributeName = 'realmId'): string[] {
    return [...new Set([KEY_FIELD, ...readDefaultFieldNames(schema), realmAttributeName])];
}

/**
 * Widen a read's projection to the fields a per-row decision reads, so that
 * the decision and the response come from one read: a sparse fieldset
 * (`fields=id`) would otherwise hide the realm and the attributes a policy
 * reads. `fields` holds root fields and relation paths (`analysisBucket.type`);
 * a relation path joins its relation if the read did not.
 *
 * A read that names no field already loads the whole row and is returned as
 * it is, as is a grouped read, which has no rows to decide. Run the decision
 * on {@link readCheckAttributes} of each row and pass the rows returned to
 * {@link trimReadProjection}.
 */
export function widenReadProjection(query: IQuery, fields: string[]): ReadProjection {
    const requested = query.fields.value
        .filter((field) => field.operator !== FieldOperator.EXCLUDE)
        .map((field) => field.name);

    if (requested.length === 0 || isGroupedQuery(query)) {
        return {
            query, 
            attributes: undefined, 
            trimmed: [], 
        };
    }

    const relations = new Set<string>([
        ...query.relations.value.map((relation) => relation.name.split('.')[0]),
        ...requested.filter((name) => name.includes('.')).map((name) => name.split('.')[0]),
    ]);

    const added: string[] = [];
    const trimmed = new Set<string>();

    for (const name of fields) {
        if (requested.includes(name) || added.includes(name)) {
            continue;
        }

        added.push(name);

        if (name === KEY_FIELD) {
            continue;
        }

        const [head] = name.split('.');

        trimmed.add(name.includes('.') && !relations.has(head) ? head : name);
    }

    const attributes = fields.filter((name) => !name.includes('.'));

    if (added.length === 0) {
        return {
            query, 
            attributes, 
            trimmed: [], 
        };
    }

    return {
        query: new Query({
            fields: new Fields([...query.fields.value, ...added.map((name) => new Field(name))]),
            filters: query.filters,
            relations: query.relations,
            pagination: query.pagination,
            sorts: query.sorts,
            groups: query.groups,
            aggregates: query.aggregates,
        }),
        attributes,
        trimmed: [...trimmed],
    };
}

/**
 * What a per-row decision sees of a row read through a widened projection:
 * its check fields as stored, never a field the read only asked for (a gated
 * secret) nor an included relation. An unprojected read's row as loaded.
 */
export function readCheckAttributes(row: object, projection: ReadProjection): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    if (!projection.attributes) {
        for (const key of Object.keys(row)) {
            output[key] = Reflect.get(row, key);
        }

        return output;
    }

    for (const name of projection.attributes) {
        if (Reflect.has(row, name)) {
            output[name] = Reflect.get(row, name);
        }
    }

    return output;
}

/**
 * Remove what a widened projection loaded only for the decision, so each
 * row carries exactly the projection the read asked for.
 */
export function trimReadProjection<T extends object>(rows: T[], projection: ReadProjection): T[] {
    for (const path of projection.trimmed) {
        const segments = path.split('.');

        for (const row of rows) {
            removePath(row, segments);
        }
    }

    return rows;
}

function removePath(value: unknown, segments: string[]): void {
    if (Array.isArray(value)) {
        for (const item of value) {
            removePath(item, segments);
        }

        return;
    }

    if (typeof value !== 'object' || value === null) {
        return;
    }

    const [head, ...rest] = segments;

    if (rest.length === 0) {
        Reflect.deleteProperty(value, head);

        return;
    }

    removePath(Reflect.get(value, head), rest);
}

/**
 * The value at a dotted path of a row (`analysisBucket.type`).
 */
export function readPath(row: unknown, path: string): unknown {
    let value = row;

    for (const segment of path.split('.')) {
        if (typeof value !== 'object' || value === null) {
            return undefined;
        }

        value = Reflect.get(value, segment);
    }

    return value;
}
