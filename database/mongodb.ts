import { MongoClient, type Document } from "mongodb";

const uri: string = <string>Bun.env.MONGO_URI;
const client = new MongoClient(uri);

async function getCollection<T extends Document>(collectionName: string) {
  try {
    await client.connect();
    const database = client.db(Bun.env.MONGO_DB);
    return database.collection<T>(collectionName);
  } catch (error) {
    throw new Error("Error connecting to the database");
  }
}

export { getCollection };
