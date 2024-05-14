<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARobotForm, injectHTTPClient } from '@authup/client-web-kit';
import type { Robot } from '@authup/core-kit';
import type { ServiceID } from '@privateaim/core';
import type { PropType, Ref } from 'vue';
import { ref, toRefs } from 'vue';
import {
    createError,
    defineNuxtComponent,
    navigateTo,
    updateObjectProperties,
    useToast,
} from '#imports';

export default defineNuxtComponent({
    components: {
        ARobotForm,
    },
    props: {
        entityId: {
            type: String as PropType<ServiceID>,
            required: true,
        },
    },
    async setup(props) {
        const refs = toRefs(props);

        const toast = useToast();

        let entity : Ref<Robot>;

        try {
            const response = await injectHTTPClient().robot.getMany({
                filter: {
                    name: refs.entityId.value,
                },
                fields: ['+secret'],
            });

            const robot = response.data.pop();
            if (!robot) {
                throw new Error('The robot was not found.');
            }

            entity = ref(robot);
        } catch (e) {
            await navigateTo({ path: '/admin/services' });
            throw createError({});
        }

        const handleUpdated = (item: Robot) => {
            updateObjectProperties(entity, item);

            toast.show({ variant: 'success', body: 'The robot was successfully updated.' });
        };

        return {
            entity,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div>
        <ARobotForm
            v-if="entity"
            :name="entityId"
            :realm-id="entity.realm_id"
            :entity="entity"
            @updated="handleUpdated"
        />
    </div>
</template>
