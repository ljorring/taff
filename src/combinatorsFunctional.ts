import { Context } from "@azure/functions"

declare type ContextAction = (context: Context) => Promise<void>

declare interface IMiddleware<NextInput> {
    (next: (input: NextInput) => Promise<ContextAction>): Promise<ContextAction>
}

declare interface Middleware<NextInput> extends IMiddleware<NextInput> {
    bind: <NextInput2>(m2Factory: (input: NextInput) => IMiddleware<NextInput2>)
}

type MiddlewareFactory<Input, NextInput> = (a: Input) => IMiddleware<NextInput>

let lift = <NextInput>(m: IMiddleware<NextInput>) => {
    let result: Middleware<NextInput> = m

    result.bind = <NextInput2>(m2Factory: (a: NextInput) => IMiddleware<NextInput2>) => bind(m, m2Factory)

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

