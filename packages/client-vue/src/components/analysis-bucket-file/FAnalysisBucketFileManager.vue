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
    defineComponent, ref, toRef,
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
        fileEntity: {
            type: Object as PropType<AnalysisBucketFile>,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed', 'setEntrypointFile'],
    setup(props, { emit }) {
        const coreClient = injectCoreHTTPClient();

        const entrypointFile = toRef(props, 'fileEntity');

        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

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

        const updateEntrypointFile = (entity: AnalysisBucketFile) => {
            if (entity.root) {
                emit('setEntrypointFile', entity);

                return;
            }

            if (
                entrypointFile.value &&
                entrypointFile.value.id === entity.id
            ) {
                emit('setEntrypointFile', null);
            }
        };

        const handleCreated = (entity: AnalysisBucketFile) => {
            emit('created', entity);

            updateEntrypointFile(entity);
        };

        const handleDeleted = (entity: AnalysisBucketFile) => {
            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);

            updateEntrypointFile(entity);
        };

        const handleUpdated = (entity: AnalysisBucketFile) => {
            emit('updated', entity);

            updateEntrypointFile(entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUploaded = () => {
            emit('uploaded');

            toggleModal();
        };

        const handleFileUploaded = (entity: AnalysisBucketFile) => {
            handleCreated(entity);
        };

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
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

            entrypointFile,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <div>
            <slot
                name="header"
                :add="toggleModal"
            >
                <button
                    type="button"
                    class="btn btn-primary btn-block"
                    @click.prevent="toggleModal"
                >
                    <i class="fa fa-upload" /> Upload
                </button>
            </slot>
        </div>
        <div>
            <div class="form-check">
                <input
                    id="selectAllFiles"
                    v-model="selectAll"
                    type="checkbox"
                    class="form-check-input"
                    @change="selectAllFiles"
                >
                <label for="selectAllFiles">Select all</label>
            </div>

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
                    <p class="mb-2">
                        No files are selected for the analysis yet.
                    </p>
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        @click.prevent="toggleModal"
                    >
                        <i class="fa fa-add" /> Add
                    </button>
                </template>
                <template #body="props">
                    <div class="d-flex flex-column">
                        <template
                            v-for="file in props.data"
                            :key="file.id"
                        >
                            <FAnalysisFile
                                class="me-1"
                                :entity="file"
                                :files-selected="selected"
                                @check="toggleFile"
                                @updated="props.updated"
                                @deleted="props.deleted"
                            />
                        </template>
                    </div>
                </template>
            </FAnalysisBucketFiles>

            <div class="form-group">
                <button
                    type="button"
                    class="btn btn-warning btn-xs"
                    :disabled="busy || selected.length === 0"
                    @click.prevent="dropSelected"
                >
                    <i class="fa fa-trash" /> Delete
                </button>
            </div>
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
