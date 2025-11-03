<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type {
    AnalysisBucket,
    AnalysisBucketFile,
} from '@privateaim/core-kit';
import { BModal } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import type { BuildInput } from 'rapiq';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import FAnalysisFile from './FAnalysisBucketFile.vue';
import { FAnalysisBucketFiles } from './FAnalysisBucketFiles';
import FAnalysisBucketFileUpload from './FAnalysisBucketFileUpload.vue';

export default defineComponent({
    components: {
        BModal,
        FAnalysisBucketFileUpload,
        FAnalysisBucketFiles,
        FAnalysisFile,
    },
    props: {
        entity: {
            type: Object as PropType<AnalysisBucket>,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed'],
    setup(props, { emit, expose }) {
        const coreClient = injectCoreHTTPClient();

        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const add = () => toggleModal();

        expose({
            add,
        });

        const selected = ref<string[]>([]);
        const selectAll = ref<boolean>(false);
        const busy = ref<boolean>(false);

        const fileListNode = ref<null | typeof FAnalysisBucketFiles>(null);
        const fileListQuery = computed<BuildInput<AnalysisBucketFile>>(() => ({
            filters: {
                analysis_id: props.entity.analysis_id,
                bucket_id: props.entity.id,
            },
        }));

        const updateAll = (entity: AnalysisBucketFile) => {
            if (!entity.root || !fileListNode.value) return;

            const data = fileListNode.value.data as unknown as AnalysisBucketFile[];

            for (let i = 0; i < data.length; i++) {
                if (data[i].id === entity.id) continue;

                data[i].root = false;
            }
        };

        const handleCreated = (entity: AnalysisBucketFile) => {
            emit('created', entity);

            updateAll(entity);
        };

        const handleDeleted = (entity: AnalysisBucketFile) => {
            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);

            updateAll(entity);
        };

        const handleUpdated = (entity: AnalysisBucketFile) => {
            emit('updated', entity);

            updateAll(entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUploaded = () => {
            emit('uploaded');

            toggleModal();
        };

        const handleFileUploaded = (entity: AnalysisBucketFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleCreated(entity);
            }

            handleCreated(entity);
        };

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
                    // todo: storage client delete files
                    const file = await coreClient.analysisBucketFile.delete(selected.value[i]);
                    handleDeleted(file);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const selectAllFiles = () => {
            if (selectAll.value) {
                if (fileListNode.value) {
                    selected.value = (fileListNode.value.data as unknown as AnalysisBucketFile[])
                        .map((file) => file.id);
                }
            } else {
                selected.value = [];
            }
        };

        const toggleFile = (file: AnalysisBucketFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);
            }
        };

        return {
            busy,

            selected,
            selectAll,
            dropSelected,
            selectAllFiles,

            handleCreated,
            handleDeleted,
            handleUpdated,
            handleFailed,
            handleUploaded,
            handleFileUploaded,

            toggleFile,

            fileListNode,
            fileListQuery,

            modal,
            toggleModal,
        };
    },
});
</script>
<template>
    <div>
        <div class="d-flex flex-column gap-1">
            <template v-if="!readonly">
                <div class="form-check mb-0">
                    <input
                        id="selectAllFiles"
                        v-model="selectAll"
                        type="checkbox"
                        class="form-check-input"
                        @change="selectAllFiles"
                    >
                    <label for="selectAllFiles">Select all</label>
                </div>
            </template>

            <FAnalysisBucketFiles
                ref="fileListNode"
                :query="fileListQuery"
                :header-search="false"
                :header-title="false"
                :footer-pagination="false"
                @created="handleCreated"
                @updated="handleUpdated"
                @deleted="handleDeleted"
            >
                <template #noMore>
                    <div class="d-flex flex-column gap-1">
                        <div>
                            No files available in analysis {{ entity.type.toLowerCase() }} bucket.
                        </div>
                        <template v-if="!readonly">
                            <div>
                                <button
                                    type="button"
                                    class="btn btn-xs btn-dark"
                                    @click.prevent="toggleModal"
                                >
                                    <i class="fa fa-add" /> Add
                                </button>
                            </div>
                        </template>
                    </div>
                </template>
                <template #body="props">
                    <div class="d-flex flex-column">
                        <template
                            v-for="file in props.data"
                            :key="file.id"
                        >
                            <FAnalysisFile
                                :readonly="readonly"
                                class="me-1"
                                :entity="file"
                                :files-selected="selected"
                                @check="toggleFile"
                                @updated="props.updated"
                                @deleted="props.deleted"
                            >
                                <template #actions="actionProps">
                                    <slot
                                        name="itemActions"
                                        v-bind="actionProps"
                                    />
                                </template>
                            </FAnalysisFile>
                        </template>
                    </div>
                </template>
            </FAnalysisBucketFiles>

            <template v-if="!readonly">
                <div>
                    <button
                        type="button"
                        class="btn btn-warning btn-xs"
                        :disabled="busy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </template>
        </div>
        <div>
            <BModal
                v-model="modal"
                :no-footer="true"
                :size="'lg'"
            >
                <template #header="props">
                    <div class="d-flex flex-row w-100">
                        <div>
                            <h5 class="mb-0">
                                <i class="fa fa-upload" /> Upload
                            </h5>
                        </div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-secondary"
                                @click.prevent="props.close()"
                            >
                                <i class="fa fa-times" />
                            </button>
                        </div>
                    </div>
                </template>

                <FAnalysisBucketFileUpload
                    :entity="entity"
                    @file-uploaded="handleFileUploaded"
                    @uploaded="handleUploaded"
                    @failed="handleFailed"
                />
            </BModal>
        </div>
    </div>
</template>
