<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARobot, AUser } from '@authup/client-web-kit';
import type { Project } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: {
        AUser,
        ARobot,
    },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
});
</script>
<template>
    <div>
        <template v-if="entity.user_id">
            <AUser :query-filters="{ id: entity.user_id }">
                <template #default="{ data }">
                    <slot
                        name="default"
                        :data="data"
                    >
                        {{ data.name }}
                    </slot>
                </template>
                <template #error="error">
                    <slot
                        name="error"
                        :data="error"
                    >
                        {{ entity.user_id }}
                    </slot>
                </template>
            </AUser>
        </template>
        <template v-else-if="entity.robot_id">
            <ARobot :query-filters="{ id: entity.robot_id }">
                <template #default="{ data }">
                    <slot
                        name="default"
                        :data="data"
                    >
                        {{ data.name }}
                    </slot>
                </template>
                <template #error="error">
                    <slot
                        name="error"
                        :data="error"
                    >
                        {{ entity.robot_id }}
                    </slot>
                </template>
            </ARobot>
        </template>
        <template v-else>
            ???
        </template>
    </div>
</template>
