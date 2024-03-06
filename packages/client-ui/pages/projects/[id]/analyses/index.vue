<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, Project, ProjectNode } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import type { BuildInput } from 'rapiq';
import { computed } from 'vue';
import type { PropType } from 'vue';
import { FAnalyses } from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: { FAnalyses },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
        visitorProjectNode: {
            type: Object as PropType<ProjectNode>,
            default: undefined,
        },
    },
    setup(props) {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.ANALYSIS_ADD,
                PermissionID.ANALYSIS_EDIT,
                PermissionID.ANALYSIS_DROP,

                PermissionID.ANALYSIS_RESULT_READ,

                PermissionID.ANALYSIS_EXECUTION_START,
                PermissionID.ANALYSIS_EXECUTION_STOP,
            ],
        });

        const query = computed<BuildInput<Analysis>>(() => ({
            filter: {
                project_id: props.entity.id,
            },
        }));

        return {
            query,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10">
            <template v-if="visitorProjectNode">
                <div class="alert alert-sm alert-warning">
                    You are not permitted to view the analyses list.
                </div>
            </template>
            <template v-else>
                <FAnalyses :query="query" />
            </template>
        </div>
    </div>
</template>
