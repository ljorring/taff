

export interface IMiddlewareFunction<TIn, TOut, TNextIn, TNextOut> {
    (context: TIn, next: (input: TNextIn) => Promise<TNextOut>): Promise<TOut>
}

type Combine = <I1,U1,NI1,NO1,
                      NI2,NO2>
(
    m1: IMiddlewareFunction<I1, U1, NI1,NO1>,
    m2: IMiddlewareFunction<NI1,NO1,NI2,NO2>
)
=> IMiddlewareFunction<I1,U1,NI2,NO2>

let combine: Combine = (m1, m2) => {

}