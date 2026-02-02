import mongoose from "mongoose";
import "dotenv/config";
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force Google/Cloudflare DNS



const MONGODB_URI = process.env.MONGO_URI;
console.log("🧪 Mongo URI:", MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      family: 4, // Force IPv4 (DNS lookup ko fix karta hai)

      bufferCommands: true,
      serverSelectionTimeoutMS: 15000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
