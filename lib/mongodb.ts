import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'adro-farmlab-remote-commander';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local or Vercel settings.');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options as any);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options as any);
  clientPromise = client.connect();
}

export { dbName };
export default clientPromise;
