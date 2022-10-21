import serve, { json, run, send } from "micro";
import http from "node:http";
import { MongoClient } from "mongodb";
import { type MongonnaRequest, applyMongnna, MongonnaClient } from "./index.js";

type Listener = http.RequestListener<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
const micro = (fn: Listener) =>
  http.createServer((req, res) => run(req, res, fn));

const server = micro(async (req, res) => {
  console.log("gotten");
  // just your everyday mongodb microservice. You'd probably secure this
  const j: MongonnaRequest = await json(req);
  console.log("Mongonna got!", j.url, j.mongoUrl, j.options, j.chain);

  // maybe cache your mongo clients by mongoUrl
  const { data, error } = await applyMongnna(
    new MongoClient("mongodb://127.0.0.1:27017/?directConnection=true"),
    j.chain
  );

  send(res, 200, { data, error });
});
server.listen(3000);
console.log("Mongonna proxy listening on 3000");

// meanwhile in client land...
console.log("Gonna... Mongonna");
setTimeout(() => {
  const x = new MongonnaClient<MongoClient>(
    "http://localhost:3000", // <= who should we talk to
    "SUPER_SECRET_SERVER_1" // <= this can be an opaque identifier or credentialed request
  );
  void (async () => {
    const res = await x.db("foo").collection("bar").find({ a: 1 }).toArray();
    console.log("RESULT", res);
  })();
}, 1000);
