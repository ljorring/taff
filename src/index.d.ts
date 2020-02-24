import { Context } from "@azure/functions";

declare namespace AzureFramework
{
    //#region Engine

    /**
     * Builds a request engine from supplied middleware.
     */
    interface RequestEngineFactory {
        (middlewares?: Middleware[]): RequestEngine
    }

    /**
     * Executes an Azure function request.
     * Supply a request parser to parse the result. Returns HTTP status 400, if parsing fails.
     */
    interface RequestEngine {
        (context: Context, handler: RequestHandler<any>): Promise<RequestHandlerResult>
        <TRequest>(context: Context, requestParser: RequestParser<TRequest>, handler: RequestHandler<TRequest>): Promise<RequestHandlerResult>
    }

    //#endregion

    //#region Handler

    type RequestHandler<TRequest> = (context: Context, request?: TRequest) => Promise<RequestHandlerResult>

    type RequestHandlerResult = RequestHandlerResponse | HttpStatusCode | void

    type RequestHandlerResponse = {
        statusCode: HttpStatusCode,
        body: any
    }

    const enum HttpStatusCode {
        OK = 200,
        OK_Created = 201,
        OK_NoResult = 204,
        Error_Bad_Request = 400,
        Error_Unauthorized = 401,
        Error_Forbidden = 403,
        Error_FileNotFound = 404,
        InternalServerError = 500
    }

    type RequestParserResult<TRequest> = {
        success: true
        request: TRequest
    } | {
        success: false,
        errorMessage: string
    }

    //#endregion

    type RequestParser<TRequest> = (context: Context) => RequestParserResult<TRequest>

    type Middleware = (context: Context, next: () => Promise<RequestHandlerResult>) => Promise<RequestHandlerResult>

}

export = AzureFramework