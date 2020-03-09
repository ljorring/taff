# Tiny Azure Functions Framework

Tiny Azure Functions Framework (or *taff*) is a small and non-intrusive framework aimed at improving the development experience of **HTTP Triggers** for **Azure Functions** running on **Node.js**.

It does so by introducing:

- (Optional) [**Middleware**](#middleware)
- (Optional) [**Request Parser**](#request-parser)
- [**Request Handler**](#request-handler)

To get started see the [Usage](#usage) section.

## Important notice

This project is in alpha. Expect bugs and missing functionality. Feel free to suggest improvements.

## Installation

Use [npm](https://www.npmjs.com/) to install taff.

```bash
npm install taff
```

## Usage

Consider the standard example of an HTTP trigger in TypeScript:

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

The code might be sufficient for a trivial example, but it handles [multiple responsibilites](https://en.wikipedia.org/wiki/Single_responsibility_principle) and won't scale well with added complexity.

So let's refactor this using taff.

```typescript
import { Middleware, RequestParser, success, fail, RequestHandler, HttpStatusCode, constructEngine } from 'taff'
import { AzureFunction } from '@azure/functions'

// 1. Create middleware for the logging

let loggingMiddleware: Middleware = async (context, next) => {
    context.log('HTTP trigger function processed a request.')

    return await next()
}

// 2. Make a parser for the name

let parseName: RequestParser<string> = context => {
    const name = (context.req.query.name || (context.req.body && context.req.body.name))

    if (name)
        return success(name)
    else
        return fail("Please pass a name on the query string or in the request body")
}

// 3. Handle the request

let sayHi: RequestHandler<string> = async (context, name) => ({
    statusCode: HttpStatusCode.OK,
    body: "Hello " + name
})

// 4. Wire up to the HTTP trigger

let requestEngine = constructEngine([loggingMiddleware])

const httpTrigger: AzureFunction = context =>
    requestEngine(context, parseName, sayHi)

export default httpTrigger;
```

## Documentation

### Components

* [Request Engine](#request-engine)
* [Middleware](#middleware)
* [Request Parser](#request-parser)
* [Request Handler](#request-handler)

### Request Engine

The request engine is the entry point to taff. Construct it using `constructEngine` (supplied with optional [middleware](#middleware)) and call it directly in the HTTP trigger:

```typescript
let requestEngine = constructEngine()

let handler: RequestHandler<void> = async context => {

    return {
        statusCode: HttpStatusCode.OK,
        body: "Hello world!"
    }
}

const httpTrigger: AzureFunction = context => requestEngine(context, handler)
```

### Middleware

A web service often consists of several endpoints with specialized functionality sharing some similar cross-cutting concerns like exception handling, logging, authentication, etc. Middleware is an architecture for handling some of these shared parts by building a common request pipeline as a basis for all (or set of) the endpoints.

taff aims to provide the same functionality commonly found in other web frameworks middleware like [Express](https://expressjs.com/en/guide/using-middleware.html) and [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-3.1), though it is kept relatively basic and doesn't involve routing.

See [Example middleware](#example-middleware) section to get started from examples.

To make use of declared middleware, supply them as an array (and mind the ordering) to the `constructEngine` factory function:

```typescript
let requestEngine = constructEngine([catchAllMiddleware, authenticateMiddleware])
```

#### Example middleware

##### Catch all exceptions

```typescript
let catchAllMiddleware: Middleware = async (context, next) => {
    try
    {
        return await next()
    }
    catch(ex)
    {
        context.log(ex?.message??ex)

        context.res = {
            status: HttpStatusCode.InternalServerError
        }
    }
}
```

##### Athenticate user

Inject a user object into the context, if the supplied request contains a valid JWT token for a user.

```typescript
let authenticateUserMiddleware: Middleware = async (context, next) => {
    let token = getTokenFromRequestHeader(context)

    if (token) {
        let verification = verifyToken(token)
        if (verification.success)
            context['user'] = verification.user
    }
    
    return await next()
}
```

##### Authorize only admins

We can constrain access by avoiding a call to the `next` function, if a user doesn't carry a specific role.

```typescript
let authorizeAdminMiddleware: Middleware = async (context, next) => {
    if (context['user'] &&
        context['user'].user?.role == "admin"
    )
        return await next()
    else
        return HttpStatusCode.Error_Unauthorized
```

Note that we rely on the user already being authenticated and injected into `context['user']`, so we have to make sure that `authenticateUserMiddleware` preceeds `authorizeAdminMiddleware` somewhere in the middleware pipeline:

```typescript
// Only allow users with the 'admin' role in the JWT token
let constrainedAccessRequestEngine = constructEngine([authenticateUserMiddleware, authorizeAdminMiddleware])

const httpTrigger: AzureFunction = context =>
    constrainedAccessRequestEngine(context, handler)
```

### Request Parser

To isolate the concern of parsing the request from handling it, you can specify a *request parser*. The request parser will be executed prior to the [request handler](#request-handler), and if it fails, the HTTP request is resolved with a 400 `Bad Request` - otherwise the request is forwarded to the [request handler](#request-handler) along with the parser result.

Use the return type to indicate, if the parsing succeeded or failed:

```typescript
type Profile = {
    name: string,
    age: number
}

let parseProfile: RequestParser<Profile> = context => {
    let name = context.req?.body['name']
    let age = parseInt(context.req?.body['age'])

    if (!name)
        return fail("You must supply a name")

    if (!age)
        return fail("You must supply an age")

    return success({
        name,
        age
    })
}
```

`fail` and `success` are optional convenience functions, which may be omitted:

```typescript
let parseProfile: RequestParser<Profile> = context => {
    let name = context.req?.body['name']
    let age = parseInt(context.req?.body['age'])

    if (!name)
        return {
            success: false,
            errorMessage: "You must supply a name"
        }

    if (!age)
        return {
            success: false,
            errorMessage: "You must supply an age"
        }

    return {
        success: true,
        request: {
            name,
            age
        }
    }
}
```

### Request Handler

The *request handler* is the final step in the taff reqest suitable for business logic of the request.

#### Return type

You may optionally return a value in the request handler, which will - depending on the type of it - become the response of the request.

```typescript
type RequestHandlerResult = RequestHandlerResponse | HttpStatusCode | void
```

- `RequestHandlerResponse` specifies an HTTP status code and a body.
- `HttpStatusCode` is a number, which will become the HTTP status code.
- `void` is the case, where nothing is returned, and taff will not alter the response.

## Limitations
taff does not handle routing. Use the built-in routing for Azure Functions and call the taff request engine explicitly for all HTTP triggers.

## License
None