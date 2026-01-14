/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { pickRecord } from '@authup/kit';
import { DomainType } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError } from '@ebec/http';
import type { LogLevel } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { ValidupValidatorError, buildErrorMessageForAttribute } from 'validup';
import {
    AnalysisEntity,
    NodeEntity,
} from '../../../../../database/index.ts';
import { isTelemetryClientUsable, useTelemetryClient } from '../../../../../services/index.ts';
import { AnalysisNodeLogValidator } from '../utils/index.ts';

export async function createAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisNodeLogValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    const nodeRepository = dataSource.getRepository(NodeEntity);
    const node = await nodeRepository.findOneBy({ id: data.node_id });
    if (!node) {
        throw new ValidupValidatorError({
            path: 'node_id',
            message: buildErrorMessageForAttribute('node_id'),
        });
    }

    data.node_realm_id = node.realm_id;

    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    const analysis = await analysisRepository.findOneBy({ id: data.analysis_id });
    if (!analysis) {
        throw new ValidupValidatorError({
            path: 'analysis_id',
            message: buildErrorMessageForAttribute('analysis_id'),
        });
    }

    data.analysis_realm_id = analysis.realm_id;

    const isAuthorityOfNode = isRealmResourceWritable(useRequestIdentityRealm(req), data.node_realm_id);
    if (!isAuthorityOfNode) {
        throw new ForbiddenError('You are not an actor of to the node realm.');
    }

    if (!isTelemetryClientUsable()) {
        return sendAccepted(res);
    }

    const telemetry = useTelemetryClient();

    const labels : Record<string, string> = {};
    const labelsRaw = {
        [LogFlag.REF_TYPE]: DomainType.ANALYSIS_NODE,
        ...(data.labels || {}),
        ...pickRecord(data, [
            'analysis_id',
            'node_id',
            'code',
            'status',
        ]),
    };

    const keys = Object.keys(labelsRaw);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (typeof labelsRaw[key] === 'string') {
            labels[key] = labelsRaw[key];
        }
    }

    await telemetry.log.create({
        level: data.level as LogLevel,
        channel: LogChannel.HTTP,
        service: 'hub-server-core',
        message: data.message,
        labels,
    });

    return sendAccepted(res);
}
