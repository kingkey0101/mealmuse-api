// import { config } from "dotenv";
// config();
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }

// import { MongoClient } from "mongodb";

// declare global {
//   var __mongoClient__: MongoClient | undefined;
// }

// const uri = process.env.MM_MONGODB_URI!;
// const options = {};

// export async function getMongoClient(): Promise<MongoClient> {
//   if (global.__mongoClient__) return global.__mongoClient__;
//   const client = new MongoClient(uri, options);
//   await client.connect();
//   global.__mongoClient__ = client;
//   return client;
// }

// export async function getDb(dbName = process.env.MM_MONGODB_DB || "mealmuse_db") {
//   const client = await getMongoClient();
//   return client.db(dbName);
// }

// Load dotenv FIRST before anything else
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient__: MongoClient | undefined;
}

const uri = process.env.MM_MONGODB_URI;
const defaultDb = process.env.MM_MONGODB_DB ?? 'mealmuse_db';
const options = {};

if (!uri) {
  console.error('Missing MM_MONGODB_URI environment variable');
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MM_MONGODB_URI is not defined');
  }

  if (globalThis.__mongoClient__) return globalThis.__mongoClient__ as MongoClient;

  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    globalThis.__mongoClient__ = client;
    return client;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    try { await client.close(); } catch (_) { }
    throw err;
  }
}

export async function getDb(dbName = defaultDb) {
  const client = await getMongoClient();
  return client.db(dbName);
}