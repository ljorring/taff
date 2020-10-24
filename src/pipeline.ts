import { Context } from '@azure/functions'
import { MiddlewareFunction, RequestEngine, RequestHandler, RequestParser, HttpStatusCode, RequestResponse } from './types'

/**
 * Constructs a request engine with the supplied middleware pipeline
 * @param middleware An array of middleware functions, which will be executed for all requests
 */
export let makeRequestPipeline = (middleware?: MiddlewareFunction[]): RequestEngine => async (
    context: Context,
    handlerOrParser: RequestHandler<any> | RequestParser<any>,
    potentialHandler?: RequestHandler<any>
) => {

    let resolveArguments = (handlerOrParser: RequestHandler<any> | RequestParser<any>, potentialHandler?: RequestHandler<any>): { handler: RequestHandler<any>, parser: RequestParser<any> | undefined } => {
        if (potentialHandler)
            return {
                handler: potentialHandler,
                parser: handlerOrParser as RequestParser<any>
            }
        else
            return {
                handler: handlerOrParser as RequestHandler<any>,
                parser: undefined
            }
    }

    let { handler, parser } = resolveArguments(handlerOrParser, potentialHandler)

    // Start execution
    let result = await runRequest(context, middleware ?? [], handler, parser)

    context.res = {
        status: result.status ?? HttpStatusCode.OK,
        body: result.body
    }
}

let runRequest = async (
        context: Context,
        middleware: MiddlewareFunction[],
        handler: RequestHandler<any>,
        parser: RequestParser<any> | undefined
    ): Promise<RequestResponse> =>
    {
        if (middleware.length > 0) {
                let nextMiddlewareFunction = middleware[0],
                succeedingMiddleware = middleware.slice(1),
                next = async () => runRequest(context, succeedingMiddleware, handler, parser)
                
            return await nextMiddlewareFunction(context, next)
        }
        else {
            if (parser) {
                let parserResult = parser(context)
                if (parserResult.success == true)
                    return await handler(context, parserResult.request)
                else
                    return {
                        status: HttpStatusCode.Error_Bad_Request,
                        body: parserResult.errorMessage
                    }
            }
            else
                return await handler(context)
        }
    }