/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IRegistryProjectMigration,
    RegistryProjectRelinkTarget,
} from '../../../../../src/app/components/registry/handlers/project/relink/types.ts';

export class FakeMigration implements IRegistryProjectMigration {
    calls: string[] = [];

    fail?: string;

    onCopy?: () => void;

    async prepare(): Promise<RegistryProjectRelinkTarget> {
        this.visit('prepare');

        return {
            externalName: 'target',
            externalId: '11',
            accountId: '21',
            accountName: 'new-robot',
            accountSecret: 'new-secret',
        };
    }

    async copy(): Promise<void> {
        this.visit('copy');
        this.onCopy?.();
    }

    async configureWebhook(): Promise<void> {
        this.visit('webhook');
    }

    private visit(step: string) {
        this.calls.push(step);

        if (step === this.fail) {
            throw new Error(`${step} failed`);
        }
    }
}
