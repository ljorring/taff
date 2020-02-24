# Tiny Azure Functions Framework

Tiny Azure Functions Framework (or 'taff') is a small framework aimed at easing the development of HTTP Triggers in Azure Functions running on Node.js.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install taff.

```bash
npm install tiny-azure-functions-framework
```

## Usage

Consider standard template for writing an Azure Functions HTTP Trigger in TypeScript:

```typescript
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

Using taff it can be written as:

```typescript
/////// Construct engine with optional middleware //////////

const loggingMiddleware: Middleware = async (context, next) => {
    context.log('HTTP trigger function processed a request.')

    return await next()
}

let requestEngine = constructEngine([loggingMiddleware])

/////// Handler logic ////////

const parseName: RequestParser<string> = context => {
    const name = (context.req.query.name || (context.req.body && context.req.body.name))

    if (name)
        return success(name)
    else
        return fail("Please pass a name on the query string or in the request body")
}

let sayHi: RequestHandler<string> = async (context, name) => ({
    statusCode: HttpStatusCode.OK,
    body: "Hello " + name
})

const httpTrigger: AzureFunction = context => requestEngine(context, parseName, sayHi)

export default httpTrigger;
```

## License
None