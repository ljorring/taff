import { Context } from '@azure/functions';

export type HandlerResult = (context: Context) => Promise<void>

declare interface IMiddlewareFunction<InputT, NextT> {
    (prevInput: InputT, next: (input: NextT) => Promise<HandlerResult>): Promise<HandlerResult>
}

declare interface MiddleWare<NextT> {
    (next: (input: NextT) => Promise<HandlerResult>): Promise<HandlerResult>
}

// declare interface MiddlewareComponent<InputT, NextT> extends IMiddlewareFunction<InputT,NextT> {
//     // // Infixes
//     // bind:         <U>(f:(v:T) => IParser<U>)              => ParserCombinator<U>
//     // then:         <U>(p: IParser<U>)                      => ChainedParserCombinator<T,U>
//     // map:          <U>(f: (t: T) => U)                     => ParserCombinator<U>
//     // or:           <U>(p2: IParser<U>)                     => ParserCombinator<T|U>
//     // sepBy:        <U>(sep: IParser<U>)                    => ParserCombinator<T[]>
//     // sepBy1:       <U>(sep: IParser<U>)                    => ParserCombinator<T[]>

//     // // Suffixes
//     // many:   () => ParserCombinator<T[]>
//     // many1:  () => ParserCombinator<T[]>
//     // maybe:  () => ParserCombinator<T | undefined>
// }

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

let combineAlt = <TInput1, TInput2>(
        m1: MiddleWare<TInput1>,
        m2: MiddleWare<TInput2>
    ): MiddleWare<[TInput1, TInput2]> =>
        next => m1(input1 => m2(input2 => next([input1,input2])))

let bind = <TInput1, TInput2>(
        m1: MiddleWare<TInput1>,
        m2Factory: (a: TInput1) => MiddleWare<TInput2>
    ): MiddleWare<TInput2> =>
        next => m1(input2 => m2Factory(input2)(next))

