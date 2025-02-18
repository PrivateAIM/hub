import type { EventCallback } from '../types';
import type { CTSMessagingEventName, STCMessagingEventName } from './constants';

export type CTSMessagingParty = {
    type: 'user' | 'robot',
    id: string
};

export type CTSMessagingMessage = {
    to: CTSMessagingParty[],
    data?: Record<string, any> | string | null,
    metadata?: Record<string, any> | null
};

export type STCMessagingMessage = {
    from: CTSMessagingParty,
    data?: Record<string, any> | string | null,
    metadata?: Record<string, any> | null
};

export type STCMessagingEvents = {
    [STCMessagingEventName.SEND]: (data: STCMessagingMessage) => void
};

export type CTSMessagingEvents = {
    [CTSMessagingEventName.SEND]: (data: CTSMessagingMessage, cb?: EventCallback) => void;
};
