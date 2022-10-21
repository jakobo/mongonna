const universalNotImplemented = [
  "addListener",
  "close",
  "emit",
  "eventNames",
  "getLogger",
  "getMaxListeners",
  "listenerCount",
  "listeners",
  "off",
  "on",
  "once",
  "prependListener",
  "prependOnceListener",
  "rawListeners",
  "removeAllListeners",
  "removeListener",
  "setMaxListeners",
  "watch",
];

const commonCursor = {
  dispatch: ["explain", "forEach", "hasNext", "next", "toArray", "tryNext"],
  notImplemented: [...universalNotImplemented],
  pivot: {},
};

type ObjectTree = Record<
  string,
  {
    dispatch: string[];
    notImplemented: string[];
    pivot: Record<keyof ObjectTree, string>;
  }
>;

export const objectTree: ObjectTree = {
  MongoClient: {
    dispatch: [],
    notImplemented: [...universalNotImplemented, "startSession", "withSession"],
    pivot: {
      db: "Db",
    },
  },
  Db: {
    dispatch: [
      "collections",
      "command",
      "createCollection",
      "createIndex",
      "dropCollection",
      "dropDatabase",
      "indexInformation",
      "profilingLevel",
      "removeUser",
      "renameCollection",
      "setProfilingLevel",
      "stats",
    ],
    notImplemented: [...universalNotImplemented],
    pivot: {
      collection: "Collection",
      collections: "ListCollectionsCursor",
      listIndexes: "ListIndexesCursor",
    },
  },
  Collection: {
    dispatch: [
      "count",
      "createIndex",
      "createIndexes",
      "deleteMany",
      "deleteOne",
      "distinct",
      "drop",
      "dropIndex",
      "dropIndexes",
      "estimatedDocumentCount",
      "findOne",
      "findOneAndDelete",
      "findOneAndReplace",
      "findOneAndUpdate",
      "indexExists",
      "indexInformation",
      "indexes",
      "insert",
      "insertMany",
      "insertOne",
      "isCapped",
      "options",
      "remove",
      "rename",
      "replaceOne",
      "stats",
      "update",
      "updateMany",
      "updateOne",
    ],
    notImplemented: [
      ...universalNotImplemented,
      "initializeOrderedBulkOp",
      "initializeUnorderedBulkOpp",
      "mapReduce",
    ],
    pivot: {
      aggregate: "AggregationCursor",
      find: "FindCursor",
      listIndexes: "ListIndexesCursor",
    },
  },
  AggregationCursor: commonCursor,
  FindCursor: commonCursor,
  ListCollectionsCursor: commonCursor,
  ListIndexesCursor: commonCursor,
};
