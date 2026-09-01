/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * The subset of a rapiq `SchemaDescription` this guard reads: the declared
 * index sequences plus the filter/sort allow-lists.
 */
export type QueryIndexInvariantDescription = {
    indexes?: string[][] | null,
    filters?: { allowed?: readonly string[] | null },
    sorts?: { allowed?: readonly string[] | null },
};

/**
 * Issue #1842 invariant: every allow-listed filter and sort key must LEAD
 * (be position 0 of) at least one declared `indexes` sequence. Anchor-mode
 * filter enforcement requires one conjunct per AND group to lead a declared
 * index, and indexed sorts must equal a leftmost prefix of one — so a key
 * that leads nothing makes enforcement reject (filters, a hard 400) or drop
 * (sorts, silently unsorted) a query the allow-lists themselves advertise.
 *
 * Consumes a schema's `describe()` output, NOT the schema object: the
 * description is the normalized shape the policies actually read, so a
 * renamed description key surfaces here as offenders instead of being
 * silently skipped. A `null`/`undefined`/empty `indexes` list therefore
 * makes EVERY allowed key an offender — a schema that opts into `indexed`
 * policies without declaring indexes rejects everything.
 *
 * Offenders are reported as `filters.<key>` / `sorts.<key>`.
 *
 * Scope: ROOT allow-lists only. A relation-scoped (dotted) key resolves at
 * decode time against the TARGET schema's indexes via `schemaMapping`, so
 * the invariant is transitive only because every mapped target is itself
 * registered and checked by the same suites — a dotted key added to a root
 * allow-list would be falsely reported as an offender here, and the fix is
 * to extend the helper, never to weaken the check. An empty declared
 * sequence (`[]`) is ignored here — `assertSchemaMatchesEntity` is what
 * rejects it.
 *
 * server-test-kit ships no test infrastructure of its own. The per-service
 * `schema-entity-parity.spec.ts` suites that call this helper guard the
 * SCHEMAS (every call site asserts an absence of offenders); the helper
 * itself is pinned by the negative control in server-storage's copy, which
 * feeds it a literal non-leading description and asserts the exact offender
 * strings — a loosened helper fails there, not in the green-path loops.
 * rapiq's `assertSchemaMatchesEntity` guards the complementary half: that
 * every declared sequence is backed by a real entity structure.
 */
export function collectNonLeadingQueryKeys(description: QueryIndexInvariantDescription): string[] {
    const leading = new Set(
        (description.indexes ?? []).map((sequence) => sequence[0]),
    );

    const offenders: string[] = [];

    for (const key of description.filters?.allowed ?? []) {
        if (!leading.has(key)) {
            offenders.push(`filters.${key}`);
        }
    }

    for (const key of description.sorts?.allowed ?? []) {
        if (!leading.has(key)) {
            offenders.push(`sorts.${key}`);
        }
    }

    return offenders;
}
