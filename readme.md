# Tiny Azure Functions Framework

Tiny Azure Functions Framework (or **taff**) is a small and non-intrusive framework aimed at improving the development experience of **HTTP Triggers** for **Azure Functions** running on **Node.js**.

It does so by allowing you to split the request handling into 3 components:

- (Optional) **Middleware**
- (Optional) Request **Parser**
- Request **Handler**

To get started see the Usage section.

## Important notice
This project is in alpha. Expect bugs and missing functionality. Feel free to suggest improvements.

## Installation

Use [npm](https://www.npmjs.com/) to install taff.

```bash
npm install taff
```

## Usage

Consider the standard example of writing an Azure Functions HTTP Trigger in TypeScript:

```typescript
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));

    if (name) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};

export default httpTrigger;
```

Though this is concise, it violates the Single Responsibility Principle and won't scale well with added complexity.

Let's refactor this making use of taff.

```typescript
import { Middleware, RequestParser, success, fail, RequestHandler, HttpStatusCode, getEngine as constructEngine } from 'taff'
import { AzureFunction } from '@azure/functions'

// 1. Move the request logging to a middleware component

let loggingMiddleware: Middleware = async (context, next) => {
    context.log('HTTP trigger function processed a request.')

    return await next()
}

// 2. Make a parser to retrieve the name

let parseName: RequestParser<string> = context => {
    const name = (context.req.query.name || (context.req.body && context.req.body.name))

    if (name)
        return success(name)
    else
        return fail("Please pass a name on the query string or in the request body")
}

// 3. Declare our actual request handling (which is trivial, since there is no business logic)

let sayHi: RequestHandler<string> = async (context, name) => ({
    statusCode: HttpStatusCode.OK,
    body: "Hello " + name
})

// 4. Lastly tell the Azure Functions HTTP trigger to make use of all the above

let requestEngine = constructEngine([loggingMiddleware])

const httpTrigger: AzureFunction = context =>
    requestEngine(context, parseName, sayHi)

export default httpTrigger;
```
More documentation coming soon..

## Limitations
taff does not handle routing. Use the built-in routing for Azure Functions and then make the HTTP trigger explicitly call the taff framework (which means that taff is not technically a framework).

## License
None