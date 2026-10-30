/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { RegistryProjectRelinkHandler } from '../../../../../src/app/components/registry/handlers/project/relink.ts';
import type {
    IRegistryProjectRelinkStore,
    RegistryProjectRelinkSource,
    RegistryProjectRelinkTarget,
} from '../../../../../src/app/components/registry/handlers/project/relink/types.ts';
import type { RegistryProjectRelinkPayload } from '../../../../../src/app/components/registry/types.ts';
import { FakeMigration } from './fake-migration.ts';

function createSource(): RegistryProjectRelinkSource {
    return {
        project: {
            id: 'project',
            registryId: 'registry',
            name: 'node',
            type: 'node',
            public: false,
            externalName: 'source',
            externalId: '10',
            accountId: '20',
            accountName: 'old-robot',
            accountSecret: 'old-secret',
            realmId: 'realm',
            realm: undefined,
            registry: undefined,
            createdAt: '',
            updatedAt: '',
        },
        registry: {
            id: 'registry', 
            name: 'registry', 
            host: 'https://registry.example', 
            accountName: 'admin', 
            accountSecret: 'password', 
            createdAt: '', 
            updatedAt: '', 
        },
    };
}

class FakeRelinkStore implements IRegistryProjectRelinkStore {
    source: RegistryProjectRelinkSource | null = createSource();

    saved = 0;

    calls: string[] = [];

    failSave = false;

    busy = false;

    targetReserved = false;

    async withLock<T>(registryId: string, fn: () => Promise<T>): Promise<T> {
        this.calls.push(`lock:${registryId}`);

        return fn();
    }

    async load(): Promise<RegistryProjectRelinkSource | null> {
        this.calls.push('load');

        return this.source ? structuredClone(this.source) : null;
    }

    async assertIdle(): Promise<void> {
        this.calls.push('idle');

        if (this.busy) {
            throw new Error('active distribution');
        }
    }

    async assertTargetAvailable(): Promise<void> {
        this.calls.push('target-available');

        if (this.targetReserved) {
            throw new Error('target reserved');
        }
    }

    async cutover(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void> {
        this.calls.push('cutover');

        if (this.failSave || this.source?.project.externalName !== source.project.externalName) {
            throw new Error('cutover failed');
        }

        Object.assign(this.source.project, target);
        this.saved++;
    }
}

const command: RegistryProjectRelinkPayload = {
    id: 'project', 
    registryId: 'registry', 
    externalName: 'source', 
    targetExternalName: 'target', 
};

function setup() {
    const store = new FakeRelinkStore();
    const migration = new FakeMigration();

    return {
        store, 
        migration, 
        handler: new RegistryProjectRelinkHandler({ store, migration }), 
    };
}

describe('RegistryProjectRelinkHandler', () => {
    it('copies and configures the destination before atomically switching the local binding', async () => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();

        await handler.handle(command);
        expect(migration.calls).toEqual(['prepare', 'copy', 'webhook']);
        expect(store.calls).toEqual(['lock:registry', 'load', 'idle', 'target-available', 'cutover']);
        expect(store.source?.project).toMatchObject({
            externalName: 'target', 
            externalId: '11', 
            accountSecret: 'new-secret', 
        });
        expect(store.saved).toBe(1);
    });

    it.each(['prepare', 'copy', 'webhook'])('keeps source binding/credentials on %s failure and propagates it for retry', async (step) => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();
        const source = structuredClone(store.source);

        migration.fail = step;
        await expect(handler.handle(command)).rejects.toThrow(`${step} failed`);
        expect(store.source).toEqual(source);
        expect(store.saved).toBe(0);
    });

    it('rejects a locally reserved destination before any remote operation', async () => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();
        const source = structuredClone(store.source);

        store.targetReserved = true;
        await expect(handler.handle(command)).rejects.toThrow('target reserved');
        expect(migration.calls).toEqual([]);
        expect(store.source).toEqual(source);
        expect(store.saved).toBe(0);
    });

    it('keeps source binding on save failure', async () => {
        const { handler, store } = setup();
        const source = structuredClone(store.source);

        store.failSave = true;
        await expect(handler.handle(command)).rejects.toThrow('cutover failed');
        expect(store.source).toEqual(source);
    });

    it('does nothing for a duplicate delivered after the cutover', async () => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();

        await handler.handle(command);
        migration.calls = [];
        await handler.handle(command);
        expect(migration.calls).toEqual([]);
        expect(store.saved).toBe(1);
    });

    it.each([
        { registryId: 'other' },
        { externalName: 'stale-source' },
    ])('rejects stale bindings before provisioning', async (change) => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();

        Object.assign(store.source!.project, change);
        await expect(handler.handle(command)).rejects.toThrow();
        expect(migration.calls).toEqual([]);
    });

    it('rejects a missing source and active distributions', async () => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();

        store.busy = true;
        await expect(handler.handle(command)).rejects.toThrow('active distribution');
        store.source = null;
        await expect(handler.handle(command)).rejects.toThrow();
        expect(migration.calls).toEqual([]);
    });

    it('rejects an old command without an explicit target before taking any lock', async () => {
        const { handler, store } = setup();
        const oldCommand = {
            id: command.id, 
            registryId: command.registryId, 
            externalName: command.externalName, 
        };

        await expect(handler.handle(oldCommand as RegistryProjectRelinkPayload)).rejects.toThrow();
        expect(store.calls).toEqual([]);
    });

    it.each(['', 'source', '../target', 'TARGET', 'a'.repeat(65)])('rejects invalid/identical target %j', async (targetExternalName) => {
        const { handler, store } = setup();

        await expect(handler.handle({ ...command, targetExternalName })).rejects.toThrow();
        expect(store.calls).toEqual([]);
    });

    it('detects a competing binding update at cutover', async () => {
        const {
            handler, 
            store, 
            migration, 
        } = setup();

        migration.onCopy = () => {
            store.source!.project.externalName = 'newer'; 
        };
        await expect(handler.handle(command)).rejects.toThrow('cutover failed');
        expect(store.source?.project.accountSecret).toBe('old-secret');
        expect(store.saved).toBe(0);
    });
});
