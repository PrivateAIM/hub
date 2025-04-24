/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent } from 'vue';
import type { AnalysisPermission } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { renderToggleButton } from '@authup/client-web-kit';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

export const FAnalysisPermissionAssignment = defineComponent({
    props: {
        analysisId: String,
        permissionId: String,
    },
    emits: defineEntityManagerEvents<AnalysisPermission>(),
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS_PERMISSION}`,
            setup,
            socket: {
                processEvent(event) {
                    return event.data.permission_id === props.permissionId &&
                        event.data.analysis_id === props.analysisId;
                },
            },
        });

        await manager.resolve({
            query: {
                filters: {
                    analysis_id: props.analysisId,
                    permission_id: props.permissionId,
                },
            },
        });

        return () => renderToggleButton({
            changed: (value) => {
                if (value) {
                    return manager.create({
                        analysis_id: props.analysisId,
                        permission_id: props.permissionId,
                    });
                }

                return manager.delete();
            },
            value: !!manager.data.value,
            isBusy: manager.busy.value,
        });
    },
});

export default FAnalysisPermissionAssignment;
