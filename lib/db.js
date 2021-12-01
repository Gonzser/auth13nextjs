import { MongoClient } from "mongodb";
const dbUri = process.env.MONGO_URI;
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
console.log(dbUri);
export async function connectToDatabase() {
  const client = await MongoClient.connect(dbUri, dbOptions);
  // .then(() => {console.log("connectDB")});
  return client;
}
