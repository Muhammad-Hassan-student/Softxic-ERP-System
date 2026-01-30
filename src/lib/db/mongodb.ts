import mongoose from "mongoose";
import "dotenv/config";
import dns from 'node:dns';

// Is line ko connection se pehle lazmi likhein
dns.setServers(['8.8.8.8', '1.1.1.1']);


const MONGODB_URI = "mongodb+srv://ERP:hassanERP123@cluster0.jfihz67.mongodb.net/?appName=Cluster0";

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
    cached.promise = mongoose.connect("mongodb+srv://erp_db:erpDb123@cluster0.vouqoco.mongodb.net/erp", {
       family: 4, // Force IPv4
  retryWrites: true,
  connectTimeoutMS: 10000, //
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
