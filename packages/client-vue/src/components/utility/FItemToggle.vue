<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        current: {
            type: String,
            required: true,
        },
        items: {
            type: Array as PropType<string[]>,
            required: true,
        },
        isBusy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['toggle'],
    setup(props, setup) {
        const active = computed(() => props.items.includes(props.current));

        const toggle = () => {
            if (props.isBusy) {
                return;
            }

            setup.emit('toggle', {
                current: props.current,
                active: active.value,
            });
        };

        return {
            toggle,
            active,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        :toggle="toggle"
        :active="active"
    >
        {{ current }}
    </slot>
</template>
