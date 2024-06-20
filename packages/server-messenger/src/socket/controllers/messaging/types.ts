import type { EventCallback } from '../../types';
import type { CTSConnectionEvents, STCConnectionEvents } from '../connection';
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

export type STCMessagingEvents = STCConnectionEvents & {
    [STCMessagingEventName.SEND]: (data: STCMessagingMessage) => void
};

export type CTSMessagingEvents = CTSConnectionEvents & {
    [CTSMessagingEventName.SEND]: (data: Message, cb?: EventCallback) => void;
};
