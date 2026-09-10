/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { BucketFile } from '@privateaim/storage-kit';
import { ActionCommandElementType, renderActionCommand } from '../../core';

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
        const execute = async () => {
            // Same-origin, so the host-only session cookie is sent along. A direct
            // cross-subdomain storage URL cannot carry it, and a navigation
            // cannot carry an Authorization header either. The Nuxt server
            // proxies through to storage in-cluster.
            window.open(
                `/api/download/bucket-file/${props.entity.id}`,
                '_blank',
            );
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
