<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import type { ProjectNode } from '@privateaim/core-kit';
import type { Ref } from 'vue';
import { ref } from 'vue';
import {
    FPagination,
    FProjectNodeInCard,
    FProjectNodes,
    FSearch,
    FTitle, injectCoreHTTPClient,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        FPagination,
        FSearch,
        FTitle,
        FProjectNodes,
        FProjectNodeInCard,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PROJECT_APPROVE,
            ],
        });

        const api = injectCoreHTTPClient();
        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const canManage = usePermissionCheck({ name: PermissionName.PROJECT_APPROVE });

        const nodeId : Ref<string | null> = ref(null);

        try {
            const response = await api.node.getMany({
                filter: {
                    realm_id: realmId.value,
                },
            });

            const node = response.data.pop();
            if (node) {
                nodeId.value = node.id;
            }
        } catch (e) {
            // do nothing :)
        }

        const listNode = ref<null | typeof FProjectNodes>(null);

        const handleUpdated = (item: ProjectNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        const handleFailed = () => {
            // todo: handle error
        };

        return {
            realmId,
            nodeId,
            handleFailed,
            handleUpdated,
            canManage,
            listNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10">
            <FProjectNodes
                ref="listNode"
                :direction="'in'"
                :target="'project'"
                :realm-id="realmId"
                :source-id="nodeId"
                :include-project="true"
                :include-node="true"
            >
                <template #header="props">
                    <FTitle />
                    <FSearch
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #footer="props">
                    <FPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #item="props">
                    <FProjectNodeInCard
                        :key="props.data.id"
                        :entity="props.data"
                        @updated="props.updated"
                    />
                </template>
            </FProjectNodes>
        </div>
    </div>
</template>
