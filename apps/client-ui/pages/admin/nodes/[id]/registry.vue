<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    FNodeRegistryConnection,
    FNodeRegistryCredentials,
    FNodeRegistryProject,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FNodeRegistryConnection, 
        FNodeRegistryCredentials, 
        FNodeRegistryProject, 
    },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit }) {
        const handleUpdated = (e: Node) => {
            emit('updated', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div
        v-if="entity"
        class="flex flex-col gap-4"
    >
        <!--
            The node ↔ registry assignment. Owns connect/disconnect: an update of
            `registry_id` provisions or tears down the node's registry project
            server-side. Previously this lived in the general node form.
        -->
        <FNodeRegistryConnection
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />

        <template v-if="entity.registry_project_id">
            <hr class="my-0">

            <FNodeRegistryCredentials
                :entity="entity"
                @failed="handleFailed"
            />

            <hr class="my-0">

            <!--
                Secondary, repair-level action: (re)links the already-provisioned
                registry project against the registry itself (Harbor project +
                robot account) without touching the node's assignment.
            -->
            <FNodeRegistryProject
                :entity="entity"
                :realm-id="entity.realm_id"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </template>
    </div>
</template>
