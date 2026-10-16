import mongoose from 'mongoose';
import dns from 'node:dns';

// Some routers/networks refuse Node's SRV DNS lookups (querySrv ECONNREFUSED)
// even though the OS resolver works, which breaks mongodb+srv:// on this machine.
const PUBLIC_DNS = ['8.8.8.8', '1.1.1.1'];

async function open(uri) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qaroo_cms';
  try {
    const conn = await open(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    const srvIssue = /querySrv|ECONNREFUSED|ENOTFOUND|ESERVFAIL|ETIMEOUT/i.test(err.message);
    if (uri.startsWith('mongodb+srv://') && srvIssue) {
      console.warn(`MongoDB SRV lookup failed (${err.message}); retrying via public DNS ${PUBLIC_DNS.join(', ')}`);
      try {
        dns.setServers(PUBLIC_DNS);
        await mongoose.disconnect().catch(() => {});
        const conn = await open(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (retryErr) {
        console.error(`MongoDB connection error: ${retryErr.message}`);
        process.exit(1);
      }
    }
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}
