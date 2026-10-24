import { MongoClient, type Db } from 'mongodb';

const globalForMongo = globalThis as typeof globalThis & { mongoPromise?: Promise<MongoClient> };

export function databaseConfigured() { return Boolean(process.env.MONGODB_URI); }

export async function db(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required for database operations');
  if (!globalForMongo.mongoPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    globalForMongo.mongoPromise = client.connect().catch(error => { globalForMongo.mongoPromise = undefined; throw error; });
  }
  return (await globalForMongo.mongoPromise).db();
}

export async function ensureIndexes() {
  const d = await db();
  await Promise.all([
    d.collection('users').createIndex({ email: 1 }, { unique: true }),
    d.collection('products').createIndex({ slug: 1 }, { unique: true }),
    d.collection('products').createIndex({ 'variants.sku': 1 }, { unique: true }),
    d.collection('products').createIndex({ status: 1, publishedAt: -1 }),
    d.collection('products').createIndex({ categorySlug: 1, status: 1 }),
    d.collection('collections').createIndex({ slug: 1 }, { unique: true }),
    d.collection('orders').createIndex({ number: 1 }, { unique: true }),
    d.collection('orders').createIndex({ userId: 1, createdAt: -1 }),
    d.collection('orders').createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true }),
    d.collection('webhookEvents').createIndex({ stripeId: 1 }, { unique: true }),
    d.collection('homepageSections').createIndex({ enabled: 1, position: 1 }),
    d.collection('homepageSections').createIndex({ startsAt: 1, endsAt: 1 }),
    d.collection('collections').createIndex({ status: 1, releaseAt: 1 }),
    d.collection('inventoryMovements').createIndex({ productId: 1, sku: 1, createdAt: -1 }),
    d.collection('customerEvents').createIndex({ userId: 1, createdAt: -1 }),
    d.collection('auditLogs').createIndex({ createdAt: -1 }),
  ]);
}
