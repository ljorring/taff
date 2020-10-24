//#region Engine

import { Context } from "@azure/functions"

/**
 * Executes an Azure function request.
 */
export interface RequestEngine {
    (context: Context, handler: RequestHandler<any>): Promise<void>
    <TRequest>(context: Context, requestParser: RequestParser<TRequest>, handler: RequestHandler<TRequest>): Promise<void>
}

//#endregion

//#region Handler

export type RequestHandler<TRequest> = (context: Context, request?: TRequest) => Promise<RequestResponse>

export type RequestResponse = {
    status: HttpStatusCode,
    body?: any
}

export const enum HttpStatusCode {
    OK = 200,
    OK_Created = 201,
    OK_NoResult = 204,
    
    Error_Bad_Request = 400,
    Error_Unauthorized = 401,
    Error_Forbidden = 403,
    Error_NotFound = 404,

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

export type MiddlewareFunction = (context: Context, next: () => Promise<RequestResponse>) => Promise<RequestResponse>

