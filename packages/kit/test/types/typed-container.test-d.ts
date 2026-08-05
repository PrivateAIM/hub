/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line max-classes-per-file
import { describe, it } from 'vitest';
import type { Validator } from 'validup';
import { TypedContainer } from '../../src';

/**
 * The negative control for the `TypedContainer` mount-key guard.
 *
 * This is a vitest **type test** rather than an ordinary spec on purpose: every
 * `tsconfig.build.json` in the repo includes `src/**` only, so a `@ts-expect-error`
 * sitting in `test/unit/**` would be typechecked by nothing in CI and could rot
 * silently — which is exactly the failure mode the guard exists to prevent.
 *
 * Each `@ts-expect-error` below fails the run if the narrowing ever stops
 * rejecting the bad key (e.g. after a validup or pathtrace bump reintroduces the
 * `(string & {})` arm).
 */

type Registry = {
    name: string;
    accountName: string | null;
    accountSecret: string | null;
};

type WithRelation = {
    id: string;
    registry: Registry;
};

const validator = (() => undefined) as unknown as Validator;

describe('TypedContainer', () => {
    it('accepts a key that exists on T', () => {
        class Accepting extends TypedContainer<Registry> {
            protected override initialize() {
                super.initialize();

                this.mount('name', validator);
                this.mount('accountName', { optional: true }, validator);
                this.mount('accountSecret', { optional: true }, validator);
            }
        }

        return Accepting;
    });

    it('rejects a stale snake_case key', () => {
        class Rejecting extends TypedContainer<Registry> {
            protected override initialize() {
                super.initialize();

                // @ts-expect-error - the pre-camelCase name must not compile
                this.mount('account_secret', validator);

                // @ts-expect-error - with mount options in between, too
                this.mount('account_name', { optional: true }, validator);
            }
        }

        return Rejecting;
    });

    it('rejects a key that exists on no property', () => {
        class Misspelled extends TypedContainer<Registry> {
            protected override initialize() {
                super.initialize();

                // @ts-expect-error - typo
                this.mount('accountSecrets', validator);
            }
        }

        return Misspelled;
    });

    it('still accepts nested and wildcard paths', () => {
        class Nested extends TypedContainer<WithRelation> {
            protected override initialize() {
                super.initialize();

                this.mount('registry', validator);
                this.mount('registry.accountSecret', validator);

                // @ts-expect-error - nested keys are narrowed as well
                this.mount('registry.account_secret', validator);
            }
        }

        return Nested;
    });
});
