/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { BucketFile } from '@privateaim/storage-kit';
import { ActionCommandElementType, injectStorageHTTPClient, renderActionCommand } from '../../core';

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
    setup(props, { slots }) {
        const storageClient = injectStorageHTTPClient();

        const execute = async () => {
            const url = storageClient.bucketFile.getStreamURL(props.entity.id);

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
            commandTooltip: 'Download',
            classSuffix: 'dark',
            slots,
        });
    },
});

export {
    FBucketFileDownload,
};
