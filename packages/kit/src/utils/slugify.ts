/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Normalize an arbitrary string into a URL-friendly slug.
 *
 * Lowercases the input, replaces every run of non `[a-z0-9]` characters with a
 * single hyphen and trims leading/trailing hyphens. The result only contains
 * `[a-z0-9-]` and never starts/ends with a hyphen.
 */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
