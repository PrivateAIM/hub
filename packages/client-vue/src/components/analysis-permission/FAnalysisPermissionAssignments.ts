/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    defineComponent, h, mergeProps, ref,
} from 'vue';
import type { Permission } from '@authup/core-kit';
import { SlotName } from '@vuecs/list-controls';
import { APermissions, defineEntityCollectionVProps } from '@authup/client-web-kit';
import {
    FAnalysisPermissionAssignment,
} from './FAnalysisPermissionAssignment';

export const FAnalysisPermissionAssignments = defineComponent({
    props: {
        ...defineEntityCollectionVProps<Permission>(),
        entityId: {
            type: String,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { slots, attrs, expose }) {
        const vNodeRef = ref<typeof APermissions | null>(null);

        expose({
            load: (meta) => {
                if (vNodeRef.value) {
                    vNodeRef.value.load(meta);
                }
            },
        });

        return () => h(APermissions, mergeProps({ ref: vNodeRef }, props, attrs), {
            [SlotName.ITEM_ACTIONS]: (slotProps: { data: Permission }) => h(
                FAnalysisPermissionAssignment,
                {
                    readonly: props.readonly,
                    analysisId: props.entityId,
                    permissionId: slotProps.data.id,
                    key: slotProps.data.id,
                },
            ),
            ...slots,
        });
    },
});

export default FAnalysisPermissionAssignments;
