<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type {
    Analysis,
    AnalysisFile,
} from '@privateaim/core';
import {
    AnalysisFileType,
    buildAnalysisFileBucketName,
    hasOwnProperty,
} from '@privateaim/core';
import type { PropType, Ref } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import type { BuildInput } from 'rapiq';
import { injectCoreHTTPClient, injectStorageHTTPClient, wrapFnWithBusyState } from '../../core';
import FAnalysisFile from './FAnalysisFile.vue';
import { FAnalysisFiles } from './FAnalysisFiles';
import FAnalysisFormFile from './FAnalysisFormFile.vue';
import FAnalysisImageCommand from '../analysis/FAnalysisImageCommand';

export default defineComponent({
    components: {
        FAnalysisFiles,
        FAnalysisImageCommand,
        FAnalysisFormFile,
        FAnalysisFile,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        fileEntity: {
            type: Object as PropType<AnalysisFile>,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed', 'setEntrypointFile'],
    setup(props, { emit }) {
        const coreClient = injectCoreHTTPClient();
        const storageClient = injectStorageHTTPClient();

        const entrypointFile = ref(null) as Ref<AnalysisFile | null>;
        if (props.fileEntity) {
            entrypointFile.value = props.fileEntity;
        }
        const entrypointFileId = computed(() => {
            if (entrypointFile.value) {
                return entrypointFile.value.id;
            }

            return undefined;
        });

        const tempFiles = ref<File[]>([]);

        const selected = ref<string[]>([]);
        const selectAll = ref<boolean>(false);
        const directoryMode = ref<boolean>(true);
        const busy = ref<boolean>(false);

        const fileListNode = ref<null | typeof FAnalysisFiles>(null);
        const fileListQuery = computed<BuildInput<AnalysisFile>>(() => ({
            filters: {
                analysis_id: props.entity.id,
                type: AnalysisFileType.CODE,
            },
        }));

        const handleCreated = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleCreated(entity);
            }

            emit('created', entity);
        };
        const handleDeleted = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleDeleted(entity);
            }

            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleUpdated(entity);
            }

            emit('updated', entity);
        };

        const upload = wrapFnWithBusyState(busy, async () => {
            if (tempFiles.value.length === 0) return;

            try {
                const formData = new FormData();
                for (let i = 0; i < tempFiles.value.length; i++) {
                    formData.append(`files[${i}]`, tempFiles.value[i]);
                }

                // todo: replace this with reference
                const {
                    data: bucketFiles,
                } = await storageClient.bucket.upload(
                    buildAnalysisFileBucketName(AnalysisFileType.CODE, props.entity.id),
                    formData,
                );

                for (let i = 0; i < bucketFiles.length; i++) {
                    const file = await coreClient.analysisFile.create({
                        type: AnalysisFileType.CODE,
                        bucket_file_id: bucketFiles[i].id,
                        analysis_id: props.entity.id,
                        name: bucketFiles[i].path,
                    });

                    handleCreated(file);
                }

                tempFiles.value = [];

                emit('uploaded');
            } catch (e) {
                emit('failed', e);
            }
        });

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
                    const file = await coreClient.analysisFile.delete(selected.value[i]);
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
                    selected.value = (fileListNode.value.data as unknown as AnalysisFile[])
                        .map((file) => file.id);
                }
            } else {
                selected.value = [];
            }
        };

        const toggleFile = (file: AnalysisFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);
            }
        };

        const filesNode = ref<null | string>(null);

        const checkTempFiles = ($event: any) => {
            $event.preventDefault();

            for (let i = 0; i < $event.target.files.length; i++) {
                tempFiles.value.push($event.target.files[i]);
            }

            if (filesNode.value) {
                filesNode.value = '';
            }
        };

        const dropTempFile = ($event: any) => {
            const index = tempFiles.value.findIndex((file) => {
                if (
                    hasOwnProperty(file, 'webkitRelativePath') &&
                    hasOwnProperty($event, 'webkitRelativePath')
                ) {
                    return file.webkitRelativePath === $event.webkitRelativePath;
                }
                return file.name === $event.name;
            });

            if (index !== -1) {
                tempFiles.value.splice(index, 1);
            }
        };

        const changeEntryPointFile = async (file: AnalysisFile) => {
            if (entrypointFile.value) {
                if (entrypointFile.value.id === file.id) {
                    await coreClient.analysisFile.update(file.id, {
                        root: false,
                    });

                    entrypointFile.value = null;

                    emit('setEntrypointFile', null);
                } else {
                    await coreClient.analysisFile.update(entrypointFile.value.id, {
                        root: false,
                    });

                    await coreClient.analysisFile.update(file.id, {
                        root: true,
                    });

                    entrypointFile.value = file;

                    emit('setEntrypointFile', file);
                }
            } else {
                await coreClient.analysisFile.update(file.id, {
                    root: true,
                });

                entrypointFile.value = file;

                emit('setEntrypointFile', file);
            }
        };

        return {
            directoryMode,
            busy,
            checkTempFiles,
            tempFiles,

            selected,
            selectAll,
            dropSelected,
            selectAllFiles,

            dropTempFile,

            upload,

            handleCreated,
            handleDeleted,
            handleUpdated,

            toggleFile,

            entrypointFile,
            entrypointFileId,
            changeEntryPointFile,

            filesNode,
            fileListNode,
            fileListQuery,
        };
    },
});
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <h6><i class="fa fa-upload" /> Upload</h6>
                <div class="form-group">
                    <label class="form-label">{{ directoryMode ? 'Directories' : 'Files' }}</label>
                    <input
                        id="files"
                        ref="filesNode"
                        type="file"
                        :webkitdirectory="directoryMode"
                        class="form-control"
                        multiple
                        :disbaled="busy"
                        @change="checkTempFiles"
                    >
                </div>
                <div class="form-group">
                    <div class="form-check form-switch">
                        <input
                            id="train-file-manager-switch"
                            v-model="directoryMode"
                            class="form-check-input"
                            type="checkbox"
                        >
                        <label
                            class="form-check-label"
                            for="train-file-manager-switch"
                        >Directory Mode</label>
                    </div>
                </div>

                <hr>

                <div class="d-flex flex-row">
                    <div>
                        <h6 class="title text-muted">
                            Files
                            <span style="font-size: 0.65rem">
                                <span class="text-info">
                                    <i class="fa fa-memory" /> in Memory
                                </span>
                            </span>
                        </h6>
                    </div>
                    <div class="ms-auto">
                        <h6 class="title text-muted">
                            Path:
                            <span class="sub-title">
                                [root]
                            </span>
                        </h6>
                    </div>
                </div>

                <div
                    v-if="tempFiles.length === 0"
                    class="alert alert-info alert-sm m-t-10"
                >
                    You have not selected any files to upload...
                </div>

                <div class="d-flex flex-column">
                    <template
                        v-for="(file,key) in tempFiles"
                        :key="key"
                    >
                        <FAnalysisFormFile
                            class="me-1"
                            :file="file"
                            @drop="dropTempFile"
                        />
                    </template>
                </div>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="busy || tempFiles.length === 0"
                        @click.prevent="upload"
                    >
                        Upload
                    </button>
                </div>
            </div>
            <div class="col">
                <h6><i class="fa fa-bars" /> Manage</h6>

                <span>Entrypoint Command</span>
                <br>
                <FAnalysisImageCommand
                    class="mt-2 mb-2"
                    :master-image-id="entity.master_image_id"
                    :analysis-file="entrypointFile"
                    :analysis-id="entity.id"
                />

                <hr>

                <h6 class="title text-muted">
                    Files
                    <span style="font-size: 0.65rem">
                        <span class="text-success">
                            <i class="fa fa-file" /> uploaded
                        </span>
                    </span>
                </h6>

                <div
                    class="form-check"
                >
                    <input
                        id="selectAllFiles"
                        v-model="selectAll"
                        type="checkbox"
                        class="form-check-input"
                        @change="selectAllFiles"
                    >
                    <label for="selectAllFiles">Select all</label>
                </div>

                <FAnalysisFiles
                    ref="fileListNode"
                    :query="fileListQuery"
                    :header-search="false"
                    :header-title="false"
                    :footer-pagination="false"
                    @created="handleCreated"
                    @updated="handleUpdated"
                    @deleted="handleDeleted"
                >
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
                                    :file-selected-id="entrypointFileId"
                                    @check="toggleFile"
                                    @updated="props.updated"
                                    @deleted="props.deleted"
                                    @toggle="changeEntryPointFile"
                                />
                            </template>
                        </div>
                    </template>
                </FAnalysisFiles>

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
        </div>
    </div>
</template>
