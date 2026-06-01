/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';

/**
 * Normalize an arbitrary string into a URL-friendly slug.
 *
 * Lowercases the input, replaces every run of non `[a-z0-9]` characters with a
 * single hyphen and trims leading/trailing hyphens. The result is compatible
 * with authup's name rules (`/^[a-z0-9-_.]+$/`, no whitespace).
 */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate a human-friendly, URL-friendly analysis name, e.g. `brave-otter`.
 *
 * Falls back to a random `analysis-<suffix>` slug in the unlikely event the
 * two-word combination does not satisfy the minimum length constraint.
 */
export function generateAnalysisName(): string {
    const candidate = slugify(`${faker.word.adjective()}-${faker.word.noun()}`);
    if (candidate.length >= 3) {
        return candidate.slice(0, 128);
    }

    return `analysis-${faker.string.alphanumeric({ length: 8, casing: 'lower' })}`;
}
