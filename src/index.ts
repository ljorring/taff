import { Context } from "@azure/functions"

export let constructEngine: RequestEngineFactory = (middlewaresArg) => {
    let middlewarePipeline: Middleware[] = []
    
    if (middlewaresArg)
        middlewarePipeline = middlewaresArg

    let handleAzureRequest: RequestEngine = async (
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
        // @ts-ignore: Typescript is unable to 
        let result = await runRequest(context, middlewarePipeline, handler, parser)

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
                status: response.statusCode,
                body: response.body
            }
        }

        // @ts-ignore: Not sure if we can safely ignore this warning
        return result
    }

    return handleAzureRequest
}

let runRequest = async (
        context: Context,
        middlewarePipeline: Middleware[],
        handler: RequestHandler<any>,
        parser: RequestParser<any> | undefined
    ): Promise<RequestHandlerResult> =>
    {
        if (middlewarePipeline.length > 0) {
                let middleware = middlewarePipeline[0],
                succeedingMiddlewarePipeline = middlewarePipeline.slice(1),
                next = async () => runRequest(context, succeedingMiddlewarePipeline, handler, parser)
                
            return await middleware(context, next)
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

export let success = <T>(result: T): { success: true, request: T } => ({
    success: true,
    request: result
})

export let fail = (errorMessage: string): { success: false, errorMessage: string } => ({
    success: false,
    errorMessage
})

//#region Engine

/**
 * Builds a request engine from supplied middleware.
 */
export interface RequestEngineFactory {
    (middlewares?: Middleware[]): RequestEngine
}

/**
 * Executes an Azure function request.
 * Supply a request parser to parse the result. Returns HTTP status 400, if parsing fails.
 */
export interface RequestEngine {
    (context: Context, handler: RequestHandler<any>): Promise<RequestHandlerResult>
    <TRequest>(context: Context, requestParser: RequestParser<TRequest>, handler: RequestHandler<TRequest>): Promise<RequestHandlerResult>
}

//#endregion

//#region Handler

export type RequestHandler<TRequest> = (context: Context, request?: TRequest) => Promise<RequestHandlerResult>

export type RequestHandlerResult = RequestHandlerResponse | HttpStatusCode | void

export type RequestHandlerResponse = {
    statusCode: HttpStatusCode,
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

export type Middleware = (context: Context, next: () => Promise<RequestHandlerResult>) => Promise<RequestHandlerResult>