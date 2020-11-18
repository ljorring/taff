export type Action<T> = (input: T) => void

export interface IMiddleware<NextInput, Context> {
    (context: Context, next: (input: NextInput) => Promise<Action<Context>>): Promise<Action<Context>>
}

export interface Middleware<NextInput, Context> extends IMiddleware<NextInput, Context> {
    bind: <NextInput2>(m2Factory: (input: NextInput) => IMiddleware<NextInput2, Context>) => IMiddleware<NextInput2, Context>
    then: <NextInput2>(m2: IMiddleware<NextInput2, Context>)                              => IMiddleware<[NextInput, NextInput2], Context>
    map:  <NextInput2>(f: (input: NextInput) => NextInput2)                               => IMiddleware<NextInput2, Context>
}

export let lift = <NextInput, Context>(middleware: IMiddleware<NextInput, Context>) => {
    let result = <Middleware<NextInput, Context>> middleware

    result.bind = mF => lift(bind(   middleware, mF))
    result.then = m =>  lift(combine(middleware, m))
    result.map =  f =>  lift(map(    middleware, f))

    return result
}

let combine = <NextInput1, NextInput2, Context>(
        m1: IMiddleware<NextInput1, Context>,
        m2: IMiddleware<NextInput2, Context>
    ): IMiddleware<[NextInput1, NextInput2], Context> =>
        (context, next) => m1(context, input1 => m2(context, input2 => next([input1,input2])))

let bind = <NextInput1, NextInput2, Context>(
        m1: IMiddleware<NextInput1, Context>,
        m2Factory: (a: NextInput1) => IMiddleware<NextInput2, Context>
    ): IMiddleware<NextInput2, Context> =>
        (context, next) => m1(context, input2 => m2Factory(input2)(context, next))

let map = <NextInput1, NextInput2, Context>(
        m: IMiddleware<NextInput1, Context>,
        f: (input: NextInput1) => NextInput2
    ): IMiddleware<NextInput2, Context> =>
        (context, next) => m(context, input => next(f(input)) )