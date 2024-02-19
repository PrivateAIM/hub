/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDataSource } from 'typeorm-extension';
import type { AnalysisLogSaveContext } from './type';
import { AnalysisLogEntity } from './entity';

export async function saveAnalysisLog(context: AnalysisLogSaveContext) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisLogEntity);

    const entity = repository.create({
        analysis_id: context.train.id,
        realm_id: context.train.realm_id,

        component: context.component,
        command: context.command,
        event: context.event,
        step: context.step,

        error: context.error,

        status: context.status,
        status_message: context.statusMessage,
    });

    if (context.errorCode) {
        entity.error_code = context.errorCode;
        entity.error = true;
    }

    const meta : Record<string, any> = {};

    // todo: previous station_run_id, station_run_index

    entity.meta = JSON.stringify(meta);

    await repository.save(entity);
}
