<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { humanFileSize } from '@privateaim/kit';
import { computed, defineComponent, ref } from 'vue';
import { injectStorageHTTPClient, wrapFnWithBusyState } from '../../core';
import FBucketFileForm from './FBucketFileForm.vue';

// A staged file plus the relative path (incl. directories) to upload it under.
// The path is sent as the multipart filename; the storage service runs busboy
// with `preservePath: true` and keeps it as the bucket-file `path`/`directory`.
type StagedFile = { file: File; path: string };

// Drag-dropped File objects carry an empty `webkitRelativePath`, so dropped
// directories must be expanded via the FileSystem Entry API and the path read
// from `entry.fullPath` instead. (The directory picker, by contrast, fills
// `webkitRelativePath` itself.)
function readEntryFile(entry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        entry.file(resolve, reject);
    });
}

function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
        const entries: FileSystemEntry[] = [];
        // readEntries yields at most ~100 entries per call; keep reading until
        // it returns an empty batch.
        const readBatch = () => {
            reader.readEntries((batch) => {
                if (batch.length === 0) {
                    resolve(entries);
                    return;
                }
                entries.push(...batch);
                readBatch();
            }, reject);
        };
        readBatch();
    });
}

async function collectEntry(entry: FileSystemEntry, out: StagedFile[]): Promise<void> {
    if (entry.isFile) {
        const file = await readEntryFile(entry as FileSystemFileEntry);
        out.push({ file, path: entry.fullPath.replace(/^\/+/, '') });
        return;
    }

    if (entry.isDirectory) {
        const children = await readAllEntries((entry as FileSystemDirectoryEntry).createReader());
        for (const child of children) {
            await collectEntry(child, out);
        }
    }
}

export default defineComponent({
    components: { FBucketFileForm },
    props: {
        bucketId: {
            type: String,
            required: true,
        },
    },
    emits: ['uploaded', 'failed'],
    setup(props, { emit }) {
        const storageClient = injectStorageHTTPClient();

        const busy = ref(false);
        const tempFiles = ref<StagedFile[]>([]);
        const directoryMode = ref<boolean>(true);
        const dragOver = ref<boolean>(false);

        const totalSize = computed(
            () => tempFiles.value.reduce((acc, item) => acc + item.file.size, 0),
        );

        // Stage files, deduping by relative path. The server enforces a unique
        // (bucket_id, path), so re-adding the same path would only produce a
        // duplicate row and a 409 on upload — drop it here instead.
        const addStaged = (staged: StagedFile[]) => {
            const existing = new Set(tempFiles.value.map((item) => item.path));
            for (const item of staged) {
                if (!existing.has(item.path)) {
                    tempFiles.value.push(item);
                    existing.add(item.path);
                }
            }
        };

        const addFileList = (files: FileList | null) => {
            if (!files) {
                return;
            }

            addStaged(
                Array.from(files).map((file) => ({
                    file,
                    path: file.webkitRelativePath || file.name,
                })),
            );
        };

        const checkTempFiles = (event: Event) => {
            const target = event.target as HTMLInputElement;
            addFileList(target.files);
            target.value = '';
        };

        const onDragOver = () => {
            if (!busy.value) {
                dragOver.value = true;
            }
        };

        const onDragLeave = () => {
            dragOver.value = false;
        };

        const onDrop = async (event: DragEvent) => {
            dragOver.value = false;

            if (busy.value) {
                return;
            }

            // `webkitGetAsEntry()` must be called synchronously while the
            // DataTransferItemList is still alive — collect entries before any
            // await, then traverse them asynchronously.
            const items = event.dataTransfer?.items;
            const entries: FileSystemEntry[] = [];
            if (items) {
                for (const item of Array.from(items)) {
                    const entry = typeof item.webkitGetAsEntry === 'function' ?
                        item.webkitGetAsEntry() :
                        null;
                    if (entry) {
                        entries.push(entry);
                    }
                }
            }

            if (entries.length > 0) {
                try {
                    const collected: StagedFile[] = [];
                    for (const entry of entries) {
                        await collectEntry(entry, collected);
                    }
                    addStaged(collected);
                } catch (e) {
                    // Entry-API traversal can reject (read errors, permissions)
                    // — surface it instead of failing the drop silently.
                    emit('failed', e);
                }
                return;
            }

            // Fallback for browsers without the entry API: flat files only.
            addFileList(event.dataTransfer?.files ?? null);
        };

        const dropTempFile = (file: File) => {
            const index = tempFiles.value.findIndex((el) => el.file === file);
            if (index !== -1) {
                tempFiles.value.splice(index, 1);
            }
        };

        const clearFiles = () => {
            tempFiles.value = [];
        };

        const upload = wrapFnWithBusyState(busy, async () => {
            if (tempFiles.value.length === 0) return;

            try {
                const formData = new FormData();
                for (let i = 0; i < tempFiles.value.length; i++) {
                    const { file, path } = tempFiles.value[i];
                    // 3rd arg sets the multipart filename — send the relative
                    // path so the directory structure survives to the server.
                    formData.append(`files[${i}]`, file, path);
                }

                const { data: bucketFiles } = await storageClient.bucket.upload(
                    props.bucketId,
                    formData,
                );

                tempFiles.value = [];

                emit('uploaded', bucketFiles);
            } catch (e) {
                emit('failed', e);
            }
        });

        return {
            directoryMode,
            busy,
            dragOver,
            tempFiles,
            totalSize,
            checkTempFiles,
            onDragOver,
            onDragLeave,
            onDrop,
            dropTempFile,
            clearFiles,
            upload,
            humanFileSize,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-3">
        <!-- Mode toggle -->
        <div class="upload-mode">
            <button
                type="button"
                class="upload-mode__btn"
                :class="{ active: !directoryMode }"
                :disabled="busy"
                @click.prevent="directoryMode = false"
            >
                <VCIcon name="fa6-solid:file-lines" /> Files
            </button>
            <button
                type="button"
                class="upload-mode__btn"
                :class="{ active: directoryMode }"
                :disabled="busy"
                @click.prevent="directoryMode = true"
            >
                <VCIcon name="fa6-solid:folder-open" /> Directories
            </button>
        </div>

        <!-- Dropzone -->
        <label
            class="upload-dropzone"
            :class="{ 'is-dragover': dragOver, 'is-busy': busy }"
            @dragenter.prevent="onDragOver"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
        >
            <input
                id="files"
                class="upload-dropzone__input"
                type="file"
                :webkitdirectory="directoryMode"
                multiple
                :disabled="busy"
                @change="checkTempFiles"
            >
            <span class="upload-dropzone__icon">
                <VCIcon name="fa6-solid:cloud-arrow-up" />
            </span>
            <span class="upload-dropzone__title">
                <template v-if="dragOver">
                    Release to add {{ directoryMode ? 'directories' : 'files' }}
                </template>
                <template v-else>
                    Drag &amp; drop {{ directoryMode ? 'directories' : 'files' }} here, or
                    <span class="upload-dropzone__browse">browse</span>
                </template>
            </span>
            <span class="upload-dropzone__hint">
                You can select multiple {{ directoryMode ? 'directories' : 'files' }} at once
            </span>
        </label>

        <!-- Selection -->
        <template v-if="tempFiles.length === 0">
            <div class="alert alert-info alert-sm mb-0">
                <VCIcon name="fa6-solid:circle-info" />
                No {{ directoryMode ? 'directories' : 'files' }} selected yet.
            </div>
        </template>
        <template v-else>
            <div class="upload-summary">
                <span class="upload-summary__count">
                    <strong>{{ tempFiles.length }}</strong>
                    {{ tempFiles.length === 1 ? 'file' : 'files' }} ready
                </span>
                <span class="upload-summary__size">{{ humanFileSize(totalSize) }}</span>
                <button
                    type="button"
                    class="upload-summary__clear"
                    :disabled="busy"
                    @click.prevent="clearFiles"
                >
                    <VCIcon name="fa6-solid:xmark" /> Clear all
                </button>
            </div>

            <div class="upload-file-list flex flex-col">
                <FBucketFileForm
                    v-for="(item, key) in tempFiles"
                    :key="key"
                    class="me-1"
                    :file="item.file"
                    :relative-path="item.path"
                    @drop="dropTempFile"
                />
            </div>
        </template>

        <!-- Upload action -->
        <button
            type="button"
            class="btn btn-sm btn-primary btn-block"
            :disabled="busy || tempFiles.length === 0"
            @click.prevent="upload"
        >
            <VCIcon name="fa6-solid:upload" />
            Upload{{ tempFiles.length ? ` (${tempFiles.length})` : '' }}
        </button>
    </div>
</template>
<style scoped>
/* ============================================================
   Segmented mode toggle (Files / Directories)
   ============================================================ */
.upload-mode {
    display: inline-flex;
    align-self: flex-start;
    gap: 0.2rem;
    padding: 0.2rem;
    border-radius: 0.55rem;
    background: var(--vc-color-bg-muted);
    border: 1px solid var(--vc-color-border);
}

.upload-mode__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.8rem;
    border: 0;
    border-radius: 0.4rem;
    background: transparent;
    color: var(--vc-color-fg-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.upload-mode__btn:hover:not(:disabled):not(.active) {
    color: var(--vc-color-fg);
}

.upload-mode__btn.active {
    color: var(--vc-color-on-primary, #fff);
    background: var(--vc-color-primary-600);
    box-shadow: 0 2px 8px -2px color-mix(in oklab, var(--vc-color-primary-600) 60%, transparent);
}

/* Active button keeps its white label on hover — only the surface darkens. */
.upload-mode__btn.active:hover:not(:disabled) {
    background: var(--vc-color-primary-700);
}

.upload-mode__btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* ============================================================
   Dropzone
   ============================================================ */
.upload-dropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 2.25rem 1.25rem;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    border-radius: 0.7rem;
    border: 1.5px dashed var(--vc-color-border);
    background-color: var(--vc-color-bg-muted);
    color: var(--vc-color-fg-muted);
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        color 0.2s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;
}

/* Soft brand wash that fades in on hover / drag. */
.upload-dropzone::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(
        120% 120% at 50% -10%,
        color-mix(in oklab, var(--privateaim-brand-purple) 12%, transparent),
        transparent 60%
    );
    transition: opacity 0.25s ease;
}

.upload-dropzone:hover {
    border-color: color-mix(in oklab, var(--vc-color-primary-600) 55%, var(--vc-color-border));
    color: var(--vc-color-fg);
}

.upload-dropzone:hover::before {
    opacity: 1;
}

.upload-dropzone.is-dragover {
    border-style: solid;
    border-color: var(--vc-color-primary-600);
    color: var(--vc-color-fg);
    transform: translateY(-2px);
    box-shadow: 0 14px 40px -16px color-mix(in oklab, var(--vc-color-primary-600) 70%, transparent);
}

.upload-dropzone.is-dragover::before {
    opacity: 1;
}

.upload-dropzone.is-busy {
    opacity: 0.6;
    pointer-events: none;
}

/* Visually hidden but kept in the tab order (NOT `display: none`, which drops
   it from focus) so keyboard users can tab to the input and open the picker
   with Enter/Space. It is not overlaid on the dropzone — that would let the
   native file input swallow drops and fight the label's @drop handler. */
.upload-dropzone__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Surface keyboard focus on the wrapping label, since the input itself is
   visually hidden. */
.upload-dropzone:focus-within {
    border-style: solid;
    border-color: var(--vc-color-primary-600);
    color: var(--vc-color-fg);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--vc-color-primary-600) 30%, transparent);
}

.upload-dropzone__icon {
    position: relative;
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.4rem;
    font-size: 1.4rem;
    border-radius: 9999px;
    color: #fff;
    background: linear-gradient(135deg, var(--privateaim-brand-coral), var(--privateaim-brand-purple));
    box-shadow: 0 10px 22px -10px color-mix(in oklab, var(--privateaim-brand-purple) 80%, transparent);
    transition: transform 0.25s ease;
}

.upload-dropzone:hover .upload-dropzone__icon {
    transform: translateY(-2px) scale(1.04);
}

.upload-dropzone.is-dragover .upload-dropzone__icon {
    animation: upload-bob 0.9s ease-in-out infinite;
}

@keyframes upload-bob {
    0%, 100% { transform: translateY(-3px) scale(1.08); }
    50% { transform: translateY(-7px) scale(1.08); }
}

.upload-dropzone__title {
    position: relative;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--vc-color-fg);
}

.upload-dropzone__browse {
    color: var(--vc-color-primary-600);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.upload-dropzone__hint {
    position: relative;
    font-size: 0.75rem;
    color: var(--vc-color-fg-muted);
}

/* ============================================================
   Selection summary + list
   ============================================================ */
.upload-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--vc-color-fg-muted);
}

.upload-summary__count strong {
    color: var(--vc-color-fg);
}

.upload-summary__size {
    padding: 0.1rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--vc-color-bg-muted);
    border: 1px solid var(--vc-color-border);
}

.upload-summary__clear {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border: 0;
    background: transparent;
    color: var(--vc-color-fg-muted);
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.2s ease;
}

.upload-summary__clear:hover:not(:disabled) {
    color: var(--vc-color-error-500);
}

.upload-summary__clear:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.upload-file-list {
    max-height: 220px;
    overflow-y: auto;
    padding-right: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .upload-dropzone,
    .upload-dropzone__icon,
    .upload-mode__btn {
        transition: none;
    }

    .upload-dropzone.is-dragover .upload-dropzone__icon {
        animation: none;
    }
}
</style>
