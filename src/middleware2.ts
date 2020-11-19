export type Action<T> = (item: T) => void

export type MiddlewareFunction<TContext> = (
    context: TContext,
    next: (action: Action<TContext>) => Promise<Action<TContext>>)
        => Promise<Action<TContext>>

export type HandlerFunction<TContext> = (context: TContext) => Promise<Action<TContext>>

