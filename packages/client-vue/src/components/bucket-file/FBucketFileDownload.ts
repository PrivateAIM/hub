/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { BucketFile } from '@privateaim/storage-kit';
import { STORAGE_CAPABILITY_QUERY_PARAMETER, STORAGE_CAPABILITY_URL_TOKEN_MAX_LIFETIME } from '@privateaim/storage-kit';
import {
    ActionCommandElementType,
    downloadViaAnchor,
    injectAnalysisStorageScope,
    injectCoreHTTPClient,
    injectStorageHTTPClient,
    renderActionCommand,
} from '../../core';

const FBucketFileDownload = defineComponent({
    props: {
        entity: {
            type: Object as PropType<BucketFile>,
            required: true,
        },
        elementType: {
            type: String as PropType<`${ActionCommandElementType}`>,
            default: ActionCommandElementType.BUTTON,
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
        withText: {
            type: Boolean,
            default: true,
        },
    },
    emits: ['failed'],
    setup(props, { slots, emit }) {
        const scope = injectAnalysisStorageScope();
        const coreClient = injectCoreHTTPClient();
        const storageClient = injectStorageHTTPClient();

        const execute = async () => {
            try {
                if (!scope) {
                    throw new Error('A bucket file download requires an analysis storage scope.');
                }

                // A navigation cannot carry an Authorization header, so the
                // download carries a short-lived capability in the query.
                const { token } = await coreClient.analysis.createStorageToken(scope.analysisId, {
                    cap: [`bucket-file:${props.entity.id}:read`],
                    lifetime: STORAGE_CAPABILITY_URL_TOKEN_MAX_LIFETIME,
                });

                const url = new URL(storageClient.bucketFile.getStreamURL(props.entity.id));

                url.searchParams.set(STORAGE_CAPABILITY_QUERY_PARAMETER, token);

                downloadViaAnchor(url.href);
            } catch (e) {
                emit('failed', e);
            }
        };

        return () => renderActionCommand({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: false,
            iconClass: 'fa6-solid:download',
            isAllowed: true, // todo: maybe bind to permission
            commandText: 'download',
            commandTooltip: 'Download',
            classSuffix: 'dark',
            slots,
        });
    },
});

export {
    FBucketFileDownload,
};
