export type RealtimeEventHandler<TPayload = unknown> = (payload: TPayload) => void;

/** Returned by `subscribe`; call to stop receiving the event. Safe to call more than once. */
export type RealtimeUnsubscribe = () => void;
