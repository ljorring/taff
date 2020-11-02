import { Context } from "@azure/functions"

export type ContextAction = (context: Context) => Promise<void>

export interface IMiddleware<NextInput> {
    (next: (input: NextInput) => Promise<ContextAction>): Promise<ContextAction>
}

export interface Middleware<NextInput> extends IMiddleware<NextInput> {
    bind: <NextInput2>(m2Factory: (input: NextInput) => IMiddleware<NextInput2>) => IMiddleware<NextInput2>
    then: <NextInput2>(m2: IMiddleware<NextInput2>)                              => IMiddleware<[NextInput, NextInput2]>
    map:  <NextInput2>(f: (input: NextInput) => NextInput2)                      => IMiddleware<NextInput2>
}

export let lift = <NextInput>(middleware: IMiddleware<NextInput>) => {
    let result = <Middleware<NextInput>> middleware

    result.bind = mF => lift(bind(   middleware, mF))
    result.then = m =>  lift(combine(middleware, m))
    result.map =  f =>  lift(map(    middleware, f))

    return result
}

let combine = <NextInput1, NextInput2>(
        m1: IMiddleware<NextInput1>,
        m2: IMiddleware<NextInput2>
    ): IMiddleware<[NextInput1, NextInput2]> =>
        next => m1(input1 => m2(input2 => next([input1,input2])))

let bind = <NextInput1, NextInput2>(
        m1: IMiddleware<NextInput1>,
        m2Factory: (a: NextInput1) => IMiddleware<NextInput2>
    ): IMiddleware<NextInput2> =>
        next => m1(input2 => m2Factory(input2)(next))

let map = <NextInput1, NextInput2>(
        m: IMiddleware<NextInput1>,
        f: (input: NextInput1) => NextInput2
    ): IMiddleware<NextInput2> =>
        next => m(input => next(f(input)))