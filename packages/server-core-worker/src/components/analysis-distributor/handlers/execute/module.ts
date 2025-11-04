/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import type { AnalysisDistributorCommand, AnalysisDistributorExecutePayload } from '@privateaim/server-core-worker-kit';
import { extendPayload } from '../../../utils';

export class AnalysisDistributorExecuteHandler implements ComponentHandler<
AnalysisDistributorCommand.EXECUTE,
AnalysisDistributorExecutePayload> {
    async handle(value: AnalysisDistributorExecutePayload): Promise<void> {

    }
}
