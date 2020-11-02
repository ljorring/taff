declare type ContextAction = (context: Context) => Promise<void>

declare interface MiddleWare<NextT> {
    (next: (input: NextT) => Promise<ContextAction>): Promise<ContextAction>
}

let combine = <TInput1, TInput2>(
        m1: MiddleWare<TInput1>,
        m2: MiddleWare<TInput2>
    ): MiddleWare<[TInput1, TInput2]> =>
        next => m1(input1 => m2(input2 => next([input1,input2])))

let bind = <TInput1, TInput2>(
        m1: MiddleWare<TInput1>,
        m2Factory: (a: TInput1) => MiddleWare<TInput2>
    ): MiddleWare<TInput2> =>
        next => m1(input2 => m2Factory(input2)(next))

