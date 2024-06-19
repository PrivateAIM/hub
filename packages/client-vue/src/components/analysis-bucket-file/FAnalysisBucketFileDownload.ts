/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { ActionCommandElementType, injectStorageHTTPClient, renderActionCommand } from '../../core';

const FAnalysisBucketFileDownload = defineComponent({
    props: {
        entity: {
            type: Object as PropType<AnalysisBucketFile>,
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
    setup(props, { slots }) {
        const storageClient = injectStorageHTTPClient();

        const execute = async () => {
            const url = storageClient.bucketFile.getStreamURL(props.entity.external_id);

            window.open(
                url,
                '_blank',
            );
        };

        return () => renderActionCommand({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: false,
            iconClass: 'fas fa-download',
            isAllowed: true, // todo: maybe bind to permission
            commandText: 'download',
            classSuffix: 'dark',
            slots,
        });
    },
});

export {
    FAnalysisBucketFileDownload,
};
