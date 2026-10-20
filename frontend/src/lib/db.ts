import mongoose from 'mongoose';

// Fallback to cluster URI if not defined in env, and strip any accidental quotation marks added in Vercel dashboard
let rawUri =
  process.env.MONGODB_URI ||
  'mongodb+srv://sudilthathsara19_db_user:JRekPIJDyPvd5rX9@cluster0.xqk8qbk.mongodb.net/fleetflow_db?retryWrites=true&w=majority';

// Remove accidental surrounding single or double quotes
const MONGODB_URI = rawUri.replace(/^["']|["']$/g, '').trim();

/**
 * Global is used here to maintain a cached connection across hot reloads in development
 * and across serverless function invocations on Vercel.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // If already connected and ready, return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // CRITICAL FOR VERCEL: Force IPv4 as MongoDB Atlas M0 does not support IPv6 routing on AWS Lambda
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
