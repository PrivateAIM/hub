/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisFile } from '@privateaim/core';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { injectStorageAPIClient, renderActionCommand } from '../../core';

const FAnalysisFileDownload = defineComponent({
    props: {
        entity: {
            type: Object as PropType<AnalysisFile>,
            required: true,
        },
        elementType: {
            type: String as PropType<'button' | 'link' | 'dropDownItem'>,
            default: 'button',
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
        const storageClient = injectStorageAPIClient();

        const execute = async () => {
            window.open(
                storageClient.bucketFile.getStreamPath(props.entity.bucket_file_id),
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
    FAnalysisFileDownload,
};
