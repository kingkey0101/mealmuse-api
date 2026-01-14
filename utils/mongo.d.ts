import { MongoClient } from "mongodb";
declare global {
    var __mongoClient__: MongoClient | undefined;
}
export declare function getMongoClient(): Promise<MongoClient>;
export declare function getDb(dbName?: string): Promise<import("mongodb").Db>;
//# sourceMappingURL=mongo.d.ts.map