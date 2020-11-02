import { Context } from '@azure/functions'

export interface IMiddlewareFunction<I1, U1, NI1, NO1> {
    (context: I1, next: (input: NI1) => Promise<NO1>): Promise<U1>
}

export interface MiddlewareFunctionCombinator<I1,U1,NI1,NO1> extends IMiddlewareFunction<I1, U1, NI1, NO1> {
    combine<NI2,NO2>(m2: IMiddlewareFunction<NI1,NO1,NI2,NO2>): IMiddlewareFunction<I1,U1,NI2,NO2>
}

type Combine = <I1,U1,NI1,NO1,
                      NI2,NO2>
(
    m1: IMiddlewareFunction<I1, U1, NI1,NO1>,
    m2: IMiddlewareFunction<NI1,NO1,NI2,NO2>
)
=> IMiddlewareFunction<I1,U1,NI2,NO2>

export let combine: Combine =
    ( m1, m2 ) => 
    ( context, next) => m1( context, input => m2(input, next) )

let catchAllMiddleware = async <T>(context: T, next: (input: T) => Promise<void>) => {
    try {
        return await next(context)
    }
    catch(err) {
        console.error(err?.message ?? err)
        return
    }
}

let loggingMiddleware = async <T>(context: Context, next: (input: Context) => Promise<void>) => {
    context.log('fest')
    return await next(context)
}

let whatever = combine(catchAllMiddleware, loggingMiddleware)

whatever()