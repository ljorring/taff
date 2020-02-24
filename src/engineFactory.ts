import { Context } from "@azure/functions";

import { RequestHandler, RequestParser,Middleware, HttpStatusCode, RequestHandlerResult, RequestEngineFactory, RequestEngine, RequestHandlerResponse } from "./index";

let constructEngine: RequestEngineFactory = (middlewaresArg) => {
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

export default constructEngine