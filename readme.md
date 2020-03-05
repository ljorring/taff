# Tiny Azure Functions Framework

Tiny Azure Functions Framework (or **taff**) is a small framework aimed at improving the development experience of **HTTP Triggers** for **Azure Functions** running on **Node.js**. It does so by allowing you to split the request handling into 3 components:

- (Optional) **Middleware**
- (Optional) Request **Parser**
- Request **Handler**

## Important notice
This project is in alpha. Expect bugs and missing functionality. Feel free to suggest improvements.

## Installation

Use [npm](https://www.npmjs.com/) to install taff.

```bash
npm install taff
```

## Usage

Consider the standard template for writing an Azure Functions HTTP Trigger in TypeScript:

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

Let's refactor this using taff.

1. Make a **middleware** component for the general request logging.

```typescript
let loggingMiddleware: Middleware = async (context, next) => {
    context.log('HTTP trigger function processed a request.')

    return await next()
}
```

2. Make a **parser** to take care of parsing of the name.

```typescript
let parseName: RequestParser<string> = context => {
    const name = (context.req.query.name || (context.req.body && context.req.body.name))

    if (name)
        return success(name)
    else
        return fail("Please pass a name on the query string or in the request body")
}
```

3. Declare the **handler**, which for this example is trivial, since there is no business logic.

```typescript
let sayHi: RequestHandler<string> = async (context, name) => ({
    statusCode: HttpStatusCode.OK,
    body: "Hello " + name
})
```

4. Finally tell the HTTP trigger to make use of taff and the above components

```typescript
let requestEngine = constructEngine([loggingMiddleware])

const httpTrigger: AzureFunction = context =>
    requestEngine(context, parseName, sayHi)

export default httpTrigger;
```

## License
None