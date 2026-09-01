/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 *
 * Asserts that the migrated schema matches what typeorm derives from
 * the entity metadata.
 *
 * The migration chain and the entity classes are two independent
 * descriptions of the same schema, and only the former is exercised
 * against mysql/postgres - the test suites build their schema with
 * synchronize(). Every divergence between them therefore surfaces by
 * hand, in production, as `migration generate` noise or as a constraint
 * that behaves differently from what the entity declares (issue #1823:
 * the `analyses` table carried `analysis_entity`-derived constraint
 * names through two table renames).
 *
 * This wraps typeorm-extension's `assertSchemaMatchesMetadata` rather
 * than calling the `typeorm-extension db drift` CLI, because the CLI
 * discovers a DataSource from a file while this application builds its
 * options programmatically (DataSourceOptionsBuilder injects the
 * entities, migrations and subscribers around the env-derived
 * connection).
 *
 * Run it against a database the migration chain has been applied to:
 *
 *   node dist/cli/index.mjs migration run
 *   node scripts/assert-schema-drift.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { SchemaDriftError, assertSchemaMatchesMetadata } from 'typeorm-extension';
import { DataSourceOptionsBuilder } from '../dist/app/modules/database/index.mjs';

// DataSourceOptionsBuilder emits a cwd-RELATIVE migration glob
// ('dist/adapters/database/migrations/<type>/*.{ts,js,mjs}') and typeorm
// resolves it against process.cwd(). Run from anywhere but the app root,
// zero migrations load, `skipWithoutMigrations` short-circuits and this gate
// prints success having compared nothing. Anchor cwd to the app root so the
// result cannot depend on where the script was invoked from.
const appRoot = fileURLToPath(new URL('..', import.meta.url));
process.chdir(appRoot);

const options = new DataSourceOptionsBuilder().buildWithEnv();

// The same silent no-op has a second door: a missing or empty dist. sqlite is
// the one legitimate skip (`migrations: []`, the schema synchronizes from the
// entities) — for mysql/postgres an empty migration directory can only mean
// the build did not run, so fail loudly instead of comparing nothing.
if (options.type !== 'better-sqlite3') {
    const migrationDirectory = path.resolve(appRoot, path.dirname(options.migrations[0]));
    if (!fs.existsSync(migrationDirectory) || fs.readdirSync(migrationDirectory).length === 0) {
        throw new Error(`[schema-drift] no compiled migrations in ${migrationDirectory} — run the build first`);
    }
}

try {
    // sqlite carries no migrations and synchronizes from the entities, so
    // there are never two descriptions to compare
    await assertSchemaMatchesMetadata(options, { skipWithoutMigrations: true });
} catch (error) {
    // anything else (unreachable server, bad credentials, missing database)
    // is not drift, and reporting it as drift would send whoever reads the
    // CI log looking for a schema problem that does not exist
    if (!(error instanceof SchemaDriftError)) {
        throw error;
    }

    console.error(`[schema-drift] ${options.type}: the migrated schema and the entity metadata disagree.`);
    console.error('Either the entities changed without a migration, or a migration wrote');
    console.error('something the entities do not describe.\n');
    console.error(error.message);

    process.exit(1);
}

console.log(`[schema-drift] ${options.type}: schema matches the entity metadata`);
