import { Context } from '@azure/functions';

export type HandlerResult = (context: Context) => Promise<void>

declare interface IMiddlewareFunction<InputT, NextT> {
    (prevInput: InputT, next: (input: NextT) => Promise<HandlerResult>): Promise<HandlerResult>
}

export let loggingMiddleWare: IMiddlewareFunction<void, void> = async (_, next) => {
    console.log('fest')
    return await next()
}

export let authorizeMiddleware: IMiddlewareFunction<void, {userId: number}> =
    async (_, next) => {
        return await next({ userId: 5 })
    }

export let handleRequest: IMiddlewareFunction<{userId: number}, void> =
    async (info, _) => {
        return async context => {
            context.res = {
                status: 200,
                body: `Hello ${info.userId}`
            }
        }
    }

export let combine =
    <TInput extends Object | void, TNext1 extends Object | void, TNext2>(
        m1: IMiddlewareFunction<TInput, TNext1>,
        m2: IMiddlewareFunction<TNext1, TNext2>):
            IMiddlewareFunction<TInput & TNext1, TNext2> =>
    (input, next) => m1(input, input2 => m2({ ...input, ...input2 }, next))

let handler = combine(combine(loggingMiddleWare, authorizeMiddleware), handleRequest)
