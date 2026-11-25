/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { createAllowAllActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { NODE_OFFLINE_THRESHOLD_MS, NodeStatusService } from '../../../../../src/core/services/node-status/index.ts';
import { FakeNodeComponentRepository } from '../../entities/node-component/fake-repository.ts';
import { FakeNodeRepository } from '../../entities/node/fake-repository.ts';
import { createPermissionActor } from '../../helpers/index.ts';

class CountingNodeRepository extends FakeNodeRepository {
    saves = 0;

    override async save(entity: Node, options?: Parameters<FakeNodeRepository['save']>[1]): Promise<Node> {
        this.saves++;

        return super.save(entity, options);
    }
}

function clientActor(clientId: string, realmId: string): ActorContext {
    return createPermissionActor({
        realm: { id: realmId, name: 'node-realm' },
        identity: {
            type: 'client', 
            id: clientId, 
            realmId, 
        },
    });
}

async function setup(overrides: Partial<Node> = {}, startedAt: Date = new Date(0)) {
    const nodeRepository = new CountingNodeRepository();
    const nodeComponentRepository = new FakeNodeComponentRepository(nodeRepository);
    // started long ago by default, so the offline sweep is past its grace period
    const service = new NodeStatusService({
        nodeRepository,
        nodeComponentRepository,
        startedAt,
    });

    const clientId = randomUUID();
    const realmId = randomUUID();
    const node = await nodeRepository.save(nodeRepository.create({
        name: 'node',
        clientId,
        realmId,
        online: false,
        deploymentVersion: null,
        ...overrides,
    }));

    nodeRepository.saves = 0;

    return {
        nodeRepository,
        nodeComponentRepository,
        service,
        node,
        actor: clientActor(clientId, realmId),
    };
}

const snapshot = {
    deployment: { name: 'flame', version: '1.2.3' },
    components: [{ name: 'storage', status: 'ok' }, { name: 'broker', status: 'ok' }],
};

describe('NodeStatusService', () => {
    it('writes rows, marks the node online and saves it once', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeRepository, 
            nodeComponentRepository, 
        } = await setup();

        const rows = await service.reportStatus(node.id, snapshot, actor);

        expect(rows).toHaveLength(2);
        expect(nodeComponentRepository.getAll()).toHaveLength(2);

        const stored = await nodeRepository.findOneById(node.id);

        expect(stored?.online).toBe(true);
        expect(stored?.deploymentVersion).toBe('1.2.3');
        expect(nodeRepository.saves).toBe(1);
    });

    it('does not save an online node again for an identical snapshot', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeRepository, 
        } = await setup();

        await service.reportStatus(node.id, snapshot, actor);
        await service.reportStatus(node.id, snapshot, actor);

        expect(nodeRepository.saves).toBe(1);
    });

    it('keeps deploymentVersion when the snapshot has no deployment', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeRepository, 
        } = await setup({ deploymentVersion: '0.9.0' });

        await service.reportStatus(node.id, { components: [{ name: 'storage', status: 'ok' }] }, actor);

        expect((await nodeRepository.findOneById(node.id))?.deploymentVersion).toBe('0.9.0');
    });

    it('rejects every caller but the bound client', async () => {
        const {
            service, 
            node, 
            nodeRepository, 
            nodeComponentRepository, 
        } = await setup();

        const other = clientActor(randomUUID(), node.realmId);
        const wrongRealm = clientActor(node.clientId, randomUUID());
        const user = createPermissionActor({ realm: { id: node.realmId, name: 'node-realm' } });

        for (const actor of [other, wrongRealm, user, createAllowAllActor()]) {
            await expect(service.reportStatus(node.id, snapshot, actor)).rejects.toThrow(PermissionDeniedError);
            await expect(service.reportComponentStatus(node.id, 'storage', { status: 'ok' }, actor))
                .rejects.toThrow(PermissionDeniedError);
        }

        expect(nodeComponentRepository.getAll()).toHaveLength(0);
        expect(nodeRepository.saves).toBe(0);
    });

    it('rejects a node without a client binding', async () => {
        const { service, node } = await setup({ clientId: null });

        await expect(service.reportStatus(node.id, snapshot, clientActor(randomUUID(), node.realmId)))
            .rejects.toThrow(PermissionDeniedError);
    });

    it('answers 404 for an unknown node before authorization', async () => {
        const { service } = await setup();

        await expect(service.reportStatus(randomUUID(), snapshot, createAllowAllActor()))
            .rejects.toThrow(EntityNotFoundError);
    });

    it('drops a component a later snapshot omits', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeComponentRepository, 
        } = await setup();

        await service.reportComponentStatus(node.id, 'storage', { status: 'ok' }, actor);
        expect(nodeComponentRepository.getAll()).toHaveLength(1);

        await service.reportStatus(node.id, { components: [{ name: 'broker', status: 'ok' }] }, actor);

        expect(nodeComponentRepository.getAll().map((row) => row.name)).toEqual(['broker']);
    });

    it('rejects probe fields on a component report and writes nothing', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeComponentRepository, 
        } = await setup();

        await expect(service.reportComponentStatus(node.id, 'storage', { status: 'ok', latency: 5 }, actor))
            .rejects.toThrow();
        expect(nodeComponentRepository.getAll()).toHaveLength(0);
    });

    it('rejects an invalid component name', async () => {
        const {
            service, 
            node, 
            actor, 
        } = await setup();

        await expect(service.reportComponentStatus(node.id, 'Bad Name', { status: 'ok' }, actor))
            .rejects.toThrow('component name');
        await expect(service.reportComponentStatus(node.id, 'a'.repeat(65), { status: 'ok' }, actor))
            .rejects.toThrow('component name');
    });

    it('marks silent nodes offline and a later report brings them back with one save', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeRepository, 
        } = await setup();

        await service.reportStatus(node.id, snapshot, actor);

        const reportedAt = new Date();

        nodeRepository.saves = 0;

        const changed = await service.markStaleNodesOffline(new Date(reportedAt.getTime() + NODE_OFFLINE_THRESHOLD_MS + 60_000));

        expect(changed).toContain(node.id);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(false);

        nodeRepository.saves = 0;
        await service.reportStatus(node.id, snapshot, actor);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(true);
        expect(nodeRepository.saves).toBe(1);
    });

    it('leaves a node with recent components untouched', async () => {
        const {
            service, 
            node, 
            actor, 
            nodeRepository, 
        } = await setup();

        await service.reportStatus(node.id, snapshot, actor);
        nodeRepository.saves = 0;

        expect(await service.markStaleNodesOffline()).toEqual([]);
        expect(nodeRepository.saves).toBe(0);
    });

    it('keeps an admin edit that lands between the load and the lock', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup();

        nodeComponentRepository.beforeLock = async (id) => {
            const row = await nodeRepository.findOneById(id);

            row.name = 'renamed';
            row.hidden = true;
            await nodeRepository.save(row);
        };

        await service.reportStatus(node.id, snapshot, actor);

        const stored = await nodeRepository.findOneById(node.id);

        expect(stored?.name).toBe('renamed');
        expect(stored?.hidden).toBe(true);
        expect(stored?.online).toBe(true);
        expect(stored?.deploymentVersion).toBe('1.2.3');
    });

    it('answers 404 and re-creates nothing for a node deleted before the lock', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup();

        nodeComponentRepository.beforeLock = async (id) => {
            await nodeRepository.remove(await nodeRepository.findOneById(id));
        };

        await expect(service.reportStatus(node.id, snapshot, actor)).rejects.toThrow(EntityNotFoundError);

        expect(await nodeRepository.findOneById(node.id)).toBeNull();
        expect(nodeComponentRepository.getAll()).toHaveLength(0);
        expect(nodeRepository.saves).toBe(0);
    });

    it('pairs deploymentVersion and the component set from the same report', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup();

        const first = {
            deployment: { name: 'flame', version: '1' },
            components: [{ name: 'storage', status: 'ok' }],
        };
        const second = {
            deployment: { name: 'flame', version: '2' },
            components: [{ name: 'broker', status: 'ok' }, { name: 'po', status: 'ok' }],
        };

        // The second report runs entirely after the first one's component
        // write committed and before the first call returns: a node update
        // made after that commit would pair version 1 with the second set.
        nodeComponentRepository.afterWrite = async () => {
            nodeComponentRepository.afterWrite = undefined;
            await service.reportStatus(node.id, second, actor);
        };

        await service.reportStatus(node.id, first, actor);

        expect((await nodeRepository.findOneById(node.id))?.deploymentVersion).toBe('2');
        expect(nodeComponentRepository.getAll().map((row) => row.name).sort()).toEqual(['broker', 'po']);
    });

    it('serializes a report started while another holds the node lock', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup();

        const first = {
            deployment: { name: 'flame', version: '1' },
            components: [{ name: 'storage', status: 'ok' }],
        };
        const second = {
            deployment: { name: 'flame', version: '2' },
            components: [{ name: 'broker', status: 'ok' }],
        };

        let pending: Promise<unknown> | undefined;

        // inside the first report's lock, between its component write and
        // its node update: the second one must wait for the whole first one
        nodeComponentRepository.insideLock = async () => {
            nodeComponentRepository.insideLock = undefined;
            pending = service.reportStatus(node.id, second, actor);
            await new Promise((resolve) => {
                setImmediate(resolve);
            });

            expect(nodeComponentRepository.getAll().map((row) => row.name)).toEqual(['storage']);
        };

        await service.reportStatus(node.id, first, actor);
        await pending;

        expect((await nodeRepository.findOneById(node.id))?.deploymentVersion).toBe('2');
        expect(nodeComponentRepository.getAll().map((row) => row.name)).toEqual(['broker']);
        // one save per report: online + version 1, then version 2
        expect(nodeRepository.saves).toBe(2);
    });

    it('saves once per node the sweep marks offline', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
        } = await setup();

        await service.reportStatus(node.id, snapshot, actor);
        nodeRepository.saves = 0;

        await service.markStaleNodesOffline(new Date(Date.now() + NODE_OFFLINE_THRESHOLD_MS + 60_000));

        expect(nodeRepository.saves).toBe(1);
    });

    it('skips a node that went offline between the stale query and the lock', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup();

        await service.reportStatus(node.id, snapshot, actor);

        nodeComponentRepository.beforeLock = async (id) => {
            const row = await nodeRepository.findOneById(id);

            row.online = false;
            await nodeRepository.save(row);
        };
        nodeRepository.saves = 0;

        const changed = await service.markStaleNodesOffline(new Date(Date.now() + NODE_OFFLINE_THRESHOLD_MS + 60_000));

        expect(changed).toEqual([]);
        // only the hook's own save
        expect(nodeRepository.saves).toBe(1);
    });

    it('leaves a node online that reported between the stale query and the lock', async () => {
        const {
            service,
            node,
            actor,
            nodeRepository,
            nodeComponentRepository,
        } = await setup({ online: true });

        // silent for ten minutes: a sweep candidate
        await nodeComponentRepository.save(nodeComponentRepository.create({
            nodeId: node.id,
            name: 'storage',
            status: 'ok',
            reportedAt: new Date(Date.now() - 2 * NODE_OFFLINE_THRESHOLD_MS).toISOString(),
        }));

        let reported = false;

        // the node reports after the candidate query, before the sweep's lock
        nodeComponentRepository.beforeLock = async () => {
            nodeComponentRepository.beforeLock = undefined;
            await service.reportComponentStatus(node.id, 'storage', { status: 'ok' }, actor);
            reported = true;
        };

        expect(await service.markStaleNodesOffline()).toEqual([]);
        expect(reported).toBe(true);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(true);
        expect(nodeRepository.saves).toBe(0);
    });

    it('does not sweep within the threshold after start, and sweeps after it', async () => {
        // the hub (re)starts well after the node's last report, as after an outage
        const startedAt = new Date(Date.now() + NODE_OFFLINE_THRESHOLD_MS + 60_000);
        const {
            service,
            node,
            actor,
            nodeRepository,
        } = await setup({}, startedAt);

        await service.reportStatus(node.id, snapshot, actor);
        nodeRepository.saves = 0;

        // the components are stale relative to this `now`, but the hub only just started
        const insideGrace = new Date(startedAt.getTime() + NODE_OFFLINE_THRESHOLD_MS - 1);

        expect(await service.markStaleNodesOffline(insideGrace)).toEqual([]);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(true);
        expect(nodeRepository.saves).toBe(0);

        const afterGrace = new Date(startedAt.getTime() + NODE_OFFLINE_THRESHOLD_MS);

        expect(await service.markStaleNodesOffline(afterGrace)).toEqual([node.id]);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(false);
    });
});
