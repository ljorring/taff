import { Context } from "@azure/functions";
/**
 * Constructs a request engine with the supplied middleware pipeline
 * @param middlewarePipeline An array of middleware, which will be executed for all requests
 */
export declare let constructEngine: RequestEngineFactory;
export declare let success: <T>(result: T) => {
    success: true;
    request: T;
};
export declare let fail: (errorMessage: string) => {
    success: false;
    errorMessage: string;
};
/**
 * Builds a request engine from supplied middleware.
 */
export interface RequestEngineFactory {
    (middlewarePipeline?: Middleware[]): RequestEngine;
}
/**
 * Executes an Azure function request.
 */
export interface RequestEngine {
    (context: Context, handler: RequestHandler<any>): Promise<void>;
    <TRequest>(context: Context, requestParser: RequestParser<TRequest>, handler: RequestHandler<TRequest>): Promise<void>;
}
export declare type RequestHandler<TRequest> = (context: Context, request?: TRequest) => Promise<RequestHandlerResult>;
export declare type RequestHandlerResult = RequestHandlerResponse | HttpStatusCode | void;
export declare type RequestHandlerResponse = {
    statusCode?: HttpStatusCode;
    body: any;
};
export declare const enum HttpStatusCode {
    OK = 200,
    OK_Created = 201,
    OK_NoResult = 204,
    Error_Bad_Request = 400,
    Error_Unauthorized = 401,
    Error_Forbidden = 403,
    Error_FileNotFound = 404,
    InternalServerError = 500
}
export declare type RequestParserResult<TRequest> = {
    success: true;
    request: TRequest;
} | {
    success: false;
    errorMessage: string;
};
export declare type RequestParser<TRequest> = (context: Context) => RequestParserResult<TRequest>;
export declare type Middleware = (context: Context, next: () => Promise<RequestHandlerResult>) => Promise<RequestHandlerResult>;
