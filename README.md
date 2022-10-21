# Mongonna

Serverless MongoDB. What are you ... mongonna do about it?

_naming things is hard_

# Why

Atlas App Service leaves a lot to be desired. If you're using Mongo, you just kind of wanted to use Mongo the way it was intended! Mongonna looks like & acts like a regular node.js MongoDB client with a catch- the first parameter is a proxy server that will receive your Mongo command and execute it.

# How

ES6 Proxies. And some TypeScript magic. Chain it all together, tell Mongonna about your Mongo Client, because it's a peer dependency and its your types. We're just the chaining and RPC call.

```ts
const client = new MongonnaClient<MongoClient>( // <= Tell us your MongoClient typings
  "http://localhost:3000", // <= who should we talk to
  "SUPER_SECRET_SERVER_1" // <= this can be an opaque identifier or real mongo URL
);
await client.db("foo").collection("bar").find({ a: 1 }).toArray();
//           ^         ^                 ^              ^
//            \        |                 |             /
//              \       \                |            /
//                  Every 👏🏻 Call 👏🏻 Is 👏🏻 Typed
```

# Receiving the RPC

It's up to you. You'll get a payload at your url containing

```ts
interface MongonnaRequest {
  url: string; // <= self referentia>
  mongoUrl: string; // <= That identifier from above or a full mongo URL
  options: MongonnaClientOptions; // <= The client options object
  chain: MongonnaStack; // <= The chain of calls to execute
}
```

You can then call `applyMongonna` wih your client & chain object, and we reflect those calls onto the `MongoClient` you give us. The resulting object contains the `data` result from the call, or a serialized `error` object that can be returned. Send the whole chunk back as JSON!

```ts
const { data, error } = await applyMongonna(client, chain);
sendJson(200, { data, error }); // status code 200. The call worked, errors will be rethrown locally
```

# Caveats

Cursors are awkward, because in a stateless world. `next()` would always resolve the same. There's no easy fix for that, but if you're using `toArray()` and smart queries, it can be worked around.
