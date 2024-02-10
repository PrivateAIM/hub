import type { SocketCTSEventName, SocketSTCEventName } from './constants';

export type SocketSTCEventContext<T extends Record<string, any>> = T & {
    meta: {
        roomName?: string,
        roomId?: string | number
    }
};

export type SocketEventSubscriptionTarget = string | number | undefined;
export type SocketEventCallback<T = any> = (error: Error | null, data: T) => void;

export type SocketSTSEvents = {
    [event: string]: (...args: any[]) => void;
};

export type SocketSTCEvents = {
    [K in `${SocketSTCEventName}`]: (data: SocketSTCEventContext<{id: string}>) => void
};

export type SocketCTSEvents = {
    [K in `${SocketCTSEventName}`]: (
        target: SocketEventSubscriptionTarget,
        cb?: SocketEventCallback<undefined>
    ) => void
};
