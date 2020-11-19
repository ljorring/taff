import { Context } from '@azure/functions'

export type Action<T> = (item: T) => void

export type MiddlewareFunction = (
    context: Context,
    next: (context: Context) => Promise<Context>)
        => Promise<Context>

export type HandlerFunction = (context: Context) => Promise<Context>

