import { Context } from '@azure/functions'

/**
 * Constructs a request engine with the supplied middleware pipeline
 * @param middlewarePipeline An array of middleware, which will be executed for all requests
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

    // If the handler returns undefined, we rely on the user having tweaked
    // the response object
    if (typeof result == "undefined") {
        // Do nothing.
    }
    // We assume number == HttpStatusCode
    else if (typeof result == "number") {
        context.res = {
            status: result
        }
    }
    else if (typeof result == "object") {
        let response = result as RequestHandlerResponse
        context.res = {
            status: response.statusCode ?? HttpStatusCode.OK,
            body: response.body
        }
    }
}

let runRequest = async (
        context: Context,
        middleware: MiddlewareFunction[],
        handler: RequestHandler<any>,
        parser: RequestParser<any> | undefined
    ): Promise<RequestHandlerResult> =>
    {
        if (middleware.length > 0) {
                let nextMiddlewareFunction = middleware[0],
                succeedingMiddlewarePipeline = middleware.slice(1),
                next = async () => runRequest(context, succeedingMiddlewarePipeline, handler, parser)
                
            return await nextMiddlewareFunction(context, next)
        }
        else {
            if (parser) {
                let parserResult = parser(context)
                if (parserResult.success == true)
                    return await handler(context, parserResult.request)
                else
                    return {
                        statusCode: HttpStatusCode.Error_Bad_Request,
                        body: parserResult.errorMessage
                    }
            }
            else
                return await handler(context)
        }
    }

    
//#region Engine

/**
 * Executes an Azure function request.
 */
export interface RequestEngine {
    (context: Context, handler: RequestHandler<any>): Promise<void>
    <TRequest>(context: Context, requestParser: RequestParser<TRequest>, handler: RequestHandler<TRequest>): Promise<void>
}

//#endregion

//#region Handler

export type RequestHandler<TRequest> = (context: Context, request?: TRequest) => Promise<RequestHandlerResult>

export type RequestHandlerResult = RequestHandlerResponse | HttpStatusCode | void

export type RequestHandlerResponse = {
    statusCode?: HttpStatusCode,
    body: any
}

export const enum HttpStatusCode {
    OK = 200,
    OK_Created = 201,
    OK_NoResult = 204,
    Error_Bad_Request = 400,
    Error_Unauthorized = 401,
    Error_Forbidden = 403,
    Error_FileNotFound = 404,
    InternalServerError = 500
}

export type RequestParserResult<TRequest> = {
    success: true
    request: TRequest
} | {
    success: false,
    errorMessage: string
}

//#endregion

export type RequestParser<TRequest> = (context: Context) => RequestParserResult<TRequest>

export type MiddlewareFunction = (context: Context, next: () => Promise<RequestHandlerResult>) => Promise<RequestHandlerResult>

