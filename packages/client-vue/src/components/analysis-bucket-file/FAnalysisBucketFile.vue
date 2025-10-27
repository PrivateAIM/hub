<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { isClientError } from '@privateaim/core-http-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import type {
    AnalysisBucketFile,
} from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    ref,
    watch,
} from 'vue';
import { createEntityManager, defineEntityManagerEvents, injectStorageHTTPClient } from '../../core';
import { FAnalysisBucketFileDownload } from './FAnalysisBucketFileDownload';

export default defineComponent({
    components: { FAnalysisBucketFileDownload },
    props: {
        entity: {
            type: Object as PropType<AnalysisBucketFile>,
            required: true,
        },
        filesSelected: {
            type: Array,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        ...defineEntityManagerEvents<AnalysisBucketFile>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        check: (_entity?: AnalysisBucketFile) => true,
    },
    setup(props, setup) {
        const storage = injectStorageHTTPClient();

        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS_BUCKET_FILE}`,
            props,
            setup,
        });

        const marked = computed(() => {
            if (!props.filesSelected) {
                return false;
            }

            return props.filesSelected.findIndex((file) => manager.data.value && file === manager.data.value.id) !== -1;
        });

        const isMatchRaw = computed(() => manager.data.value && manager.data.value.root);
        const isMatch = ref(false);

        watch(isMatchRaw, (val) => {
            isMatch.value = val;
        });

        if (manager.data.value) {
            isMatch.value = manager.data.value.root;
        }

        const toggle = async () => {
            if (manager.busy.value || !manager.data.value) {
                return;
            }

            await manager.update({
                root: !isMatch.value,
            });
        };

        const markToggle = () => {
            setup.emit('check', manager.data.value);
        };

        const drop = async () => {
            if (manager.busy.value) return;

            manager.busy.value = true;

            try {
                await storage.bucketFile.delete(manager.data.value!.external_id);
            } catch (e) {
                setup.emit('failed', e);

                if (!isClientError(e) || e.response.status !== 404) {
                    return;
                }
            } finally {
                manager.busy.value = false;
            }

            await manager.delete();
        };

        return {
            toggle,
            drop,
            marked,
            markToggle,
            isMatch,
            busy: manager.busy,
        };
    },
});
</script>
<template>
    <div
        class="card card-file d-flex flex-row align-items-center p-1"
        :class="{'checked': marked}"
    >
        <div
            class="card-heading align-items-center d-flex flex-row"
            @click.prevent="markToggle"
        >
            <span class="title">
                {{ entity.name }}
            </span>
        </div>
        <div class="ms-auto d-flex flex-row gap-2">
            <div>
                <FAnalysisBucketFileDownload
                    :with-text="false"
                    :with-icon="true"
                    :entity="entity"
                />
            </div>
            <template v-if="!readonly">
                <div>
                    <button
                        type="button"
                        class="btn btn-xs"
                        :disabled="busy"
                        :class="{
                            'btn-success': !isMatch,
                            'btn-warning': isMatch
                        }"
                        @click.prevent="toggle"
                    >
                        <i
                            :class="{
                                'fa fa-check': !isMatch,
                                'fa fa-times': isMatch
                            }"
                        />
                    </button>
                </div>
                <div>
                    <button
                        v-b-tooltip.hover.top
                        title="Delete"
                        type="button"
                        class="btn btn-danger btn-xs"
                        :disabled="busy"
                        @click.prevent="drop"
                    >
                        <i class="fa fa-trash" />
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>
