"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Constructs a request engine with the supplied middleware pipeline
 * @param middlewarePipeline An array of middleware, which will be executed for all requests
 */
exports.constructEngine = middlewarePipeline => {
    let _middlewarePipeline = [];
    if (middlewarePipeline)
        _middlewarePipeline = middlewarePipeline;
    let requestEngine = (context, handlerOrParser, potentialHandler) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let resolveArguments = (handlerOrParser, potentialHandler) => {
            if (potentialHandler)
                return {
                    handler: potentialHandler,
                    parser: handlerOrParser
                };
            else
                return {
                    handler: handlerOrParser,
                    parser: undefined
                };
        };
        let { handler, parser } = resolveArguments(handlerOrParser, potentialHandler);
        // Start execution
        let result = yield runRequest(context, _middlewarePipeline, handler, parser);
        // If the handler returns undefined, we rely on the user having tweaked
        // the response object
        if (typeof result == "undefined") {
            // Do nothing.
        }
        // We assume number == HttpStatusCode
        else if (typeof result == "number") {
            context.res = {
                status: result
            };
        }
        else if (typeof result == "object") {
            let response = result;
            context.res = {
                status: (_a = response.statusCode, (_a !== null && _a !== void 0 ? _a : 200 /* OK */)),
                body: response.body
            };
        }
    });
    return requestEngine;
};
let runRequest = (context, middlewarePipeline, handler, parser) => __awaiter(void 0, void 0, void 0, function* () {
    if (middlewarePipeline.length > 0) {
        let middleware = middlewarePipeline[0], succeedingMiddlewarePipeline = middlewarePipeline.slice(1), next = () => __awaiter(void 0, void 0, void 0, function* () { return runRequest(context, succeedingMiddlewarePipeline, handler, parser); });
        return yield middleware(context, next);
    }
    else {
        if (parser) {
            let parserResult = parser(context);
            if (parserResult.success == true)
                return yield handler(context, parserResult.request);
            else
                return {
                    statusCode: 400 /* Error_Bad_Request */,
                    body: parserResult.errorMessage
                };
        }
        else
            return yield handler(context);
    }
});
exports.success = (result) => ({
    success: true,
    request: result
});
exports.fail = (errorMessage) => ({
    success: false,
    errorMessage
});
