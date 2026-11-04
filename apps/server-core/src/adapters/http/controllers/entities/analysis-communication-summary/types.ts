/*
 * Copyright (c) 2026.
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CommunicationMeasurement } from '@privateaim/communication-kit';

export type AnalysisCommunicationSummary = {
    schemaVersion: number;
    generatedAt: string;
    measurements: CommunicationMeasurement[];
};
