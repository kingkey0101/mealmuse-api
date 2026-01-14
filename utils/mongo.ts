import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

declare global {
  var __mongoClient__: MongoClient | undefined;
}

const uri = process.env.MM_MONGODB_URI!;
const options = {};

export async function getMongoClient(): Promise<MongoClient> {
  if (global.__mongoClient__) return global.__mongoClient__;
  const client = new MongoClient(uri, options);
  await client.connect();
  global.__mongoClient__ = client;
  return client;
}

export async function getDb(dbName = process.env.MM_MONGODB_DB || "mealmuse_db") {
  const client = await getMongoClient();
  return client.db(dbName);
}