/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    CAPABILITY_ACTION_PATTERN,
    CAPABILITY_ID_PATTERN,
    CAPABILITY_MAX_BYTES,
    CAPABILITY_MAX_ENTRIES,
    CAPABILITY_TYPE_PATTERN,
} from './constants';
import type { CapabilityEntry } from './types';

/**
 * Parse one `type:id:action[,action]` entry.
 *
 * @throws TypeError on any malformed entry.
 */
export function parseCapabilityEntry(value: string): CapabilityEntry {
    const [type, id, rawActions, ...rest] = value.split(':');

    if (type === undefined || id === undefined || rawActions === undefined || rest.length > 0) {
        throw new TypeError(`Capability entry "${value}" must have the format type:id:actions.`);
    }

    if (!CAPABILITY_TYPE_PATTERN.test(type)) {
        throw new TypeError(`Capability entry "${value}" has an invalid type.`);
    }

    if (!CAPABILITY_ID_PATTERN.test(id)) {
        throw new TypeError(`Capability entry "${value}" has an invalid id.`);
    }

    const actions = rawActions.split(',');

    for (const action of actions) {
        if (!CAPABILITY_ACTION_PATTERN.test(action)) {
            throw new TypeError(`Capability entry "${value}" has an invalid action.`);
        }
    }

    if (new Set(actions).size !== actions.length) {
        throw new TypeError(`Capability entry "${value}" has a duplicate action.`);
    }

    return {
        type, 
        id, 
        actions, 
    };
}

/**
 * Parse a list of entries and enforce the entry count, the byte size of the
 * space-joined string and the absence of duplicate entries.
 *
 * @throws TypeError on any violation.
 */
export function parseCapabilityEntries(values: string[]): CapabilityEntry[] {
    if (values.length > CAPABILITY_MAX_ENTRIES) {
        throw new TypeError(`A capability may hold at most ${CAPABILITY_MAX_ENTRIES} entries.`);
    }

    if (new TextEncoder().encode(values.join(' ')).length > CAPABILITY_MAX_BYTES) {
        throw new TypeError(`A capability may be at most ${CAPABILITY_MAX_BYTES} bytes.`);
    }

    if (new Set(values).size !== values.length) {
        throw new TypeError('A capability must not contain duplicate entries.');
    }

    return values.map((value) => parseCapabilityEntry(value));
}

export function formatCapabilityEntry(entry: CapabilityEntry): string {
    return `${entry.type}:${entry.id}:${entry.actions.join(',')}`;
}
