import { type MongoClient } from "mongodb";
import rfdc from "rfdc";
import fetch from "cross-fetch";
import { objectTree } from "./mongo.js";

type MongonnaStack = [string, unknown[]][];

export interface MongonnaRequest {
  url: string;
  mongoUrl: string;
  options: MongonnaClientOptions;
  chain: MongonnaStack;
}

export interface MongonnaResponse {
  data?: unknown;
  error?: unknown;
}

export interface MongonnaClientOptions {
  /** The time in milliseconds to attempt a connection before timing out. */
  connectTimeoutMS?: number;
}

const clone = rfdc();

function createProxy<T extends object>(
  precursor: MongonnaStack,
  type: keyof typeof objectTree,
  url: string,
  mongoUrl: string,
  options?: MongonnaClientOptions
): T {
  const fns = objectTree[type];
  const stack = clone(precursor);

  const p = new Proxy<T>({} as unknown as T, {
    get: (target, prop: string) => {
      if (fns.notImplemented.includes(prop)) {
        throw new TypeError(`${prop} is not available in Mongonna yet`);
      }
      if (fns.pivot[prop]) {
        return (...args: unknown[]) => {
          const next = clone(stack);
          next.push([prop, args]);
          const n = createProxy(next, fns.pivot[prop], url, mongoUrl, options);
          return n;
        };
      }
      if (fns.dispatch.includes(prop)) {
        return async (...args: unknown[]) => {
          const next = clone(stack);
          next.push([prop, args]);
          const { deserializeError } = await import("serialize-error");
          const res = await fetch(url, {
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              url,
              mongoUrl,
              options: options ?? {},
              chain: next,
            } as MongonnaRequest),
          });
          const j: MongonnaResponse = await res.json();
          if (typeof j.error !== "undefined") {
            const e = deserializeError(j.error);
            throw e;
          }

          return j.data;
        };
      }
      return (...args: unknown[]) => {
        stack.push([prop, args]);
        return p; // can call again
      };
    },
  }) as unknown as T & (() => T);
  return p;
}

export const MongonnaClient = function <T extends object>(
  url: string,
  mongoUrl: string,
  options?: MongonnaClientOptions
) {
  return createProxy<T>([], "MongoClient", url, mongoUrl, options);
} as unknown as {
  new <T extends object>(
    url: string,
    mongoUrl: string,
    options?: MongonnaClientOptions
  ): T;
};

export const applyMongonna = async (
  client: MongoClient,
  chain: MongonnaStack
): Promise<{ data?: unknown; error?: unknown }> => {
  const { serializeError } = await import("serialize-error");
  try {
    let next: any = client;
    for (const [fn, args] of chain) {
      next = next[fn as keyof typeof next](...args);
    }
    const end = await next;
    return { data: end };
  } catch (e) {
    return { error: serializeError(e) };
  }
};
