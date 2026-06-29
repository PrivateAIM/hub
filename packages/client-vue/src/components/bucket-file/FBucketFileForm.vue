<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    components: {
        VCButton,
        VCIcon,
    },
    props: {
        file: {
            type: Object as PropType<File>,
            required: true,
        },
        // Explicit relative path (incl. directories). Drag-dropped files have
        // an empty webkitRelativePath, so the parent supplies the path it
        // derived from the FileSystem entry; falls back to webkitRelativePath
        // (directory picker) then the bare name.
        relativePath: {
            type: String,
            default: '',
        },
        pathSelected: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['drop'],
    setup(props, { emit }) {
        const path = computed(() => props.relativePath ||
            props.file.webkitRelativePath ||
            props.file.name);

        const drop = () => {
            emit('drop', props.file);
        };

        return {
            path,
            drop,
        };
    },
});
</script>
<template>
    <div class="card card-file flex flex-row items-center p-1">
        <div class="card-heading">
            <span class="title">
                {{ path }}
            </span>
        </div>
        <div class="ms-auto">
            <VCButton
                color="neutral"
                size="xs"
                @click.prevent="drop"
            >
                <VCIcon name="fa6-solid:trash" />
            </VCButton>
        </div>
    </div>
</template>
