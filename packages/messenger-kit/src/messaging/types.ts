import type { EventCallback } from '../types';
import type { CTSMessagingEventName, STCMessagingEventName } from './constants';

export type MessagingParty = {
    type: 'user' | 'robot',
    id: string
};

export type Message = {
    to: MessagingParty[],
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type STCMessagingMessage = {
    from: MessagingParty,
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type STCMessagingEvents = {
    [STCMessagingEventName.SEND]: (data: STCMessagingMessage) => void
};

export type CTSMessagingEvents = {
    [CTSMessagingEventName.SEND]: (data: Message, cb?: EventCallback) => void;
};
