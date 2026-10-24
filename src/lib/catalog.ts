import { ObjectId, type Filter } from 'mongodb';
import { db, databaseConfigured } from './db';
import { type Product, publishedFilter } from './domain';

export async function listProducts(options: { category?: string; q?: string; limit?: number; page?: number } = {}) {
  if (!databaseConfigured()) return { products: [] as Product[], total: 0, unconfigured: true };
  const d = await db();
  const filter: Filter<Product> = { ...publishedFilter() };
  if (options.category) filter.categorySlug = options.category;
  if (options.q) {
    const q = options.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
    filter.$and = [{ $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }, { 'variants.sku': { $regex: q, $options: 'i' } }] }];
  }
  const limit = Math.min(Math.max(options.limit || 12, 1), 48);
  const page = Math.max(options.page || 1, 1);
  const [products, total] = await Promise.all([
    d.collection<Product>('products').find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    d.collection<Product>('products').countDocuments(filter),
  ]);
  return { products, total, unconfigured: false };
}

export async function getProduct(slug: string) {
  if (!databaseConfigured()) return null;
  return db().then(d => d.collection<Product>('products').findOne({ slug, ...publishedFilter() }));
}

export async function getProductsByIds(ids: string[]) {
  const valid = ids.filter(ObjectId.isValid).map(id => new ObjectId(id));
  if (!valid.length) return [];
  return (await db()).collection<Product>('products').find({ _id: { $in: valid }, ...publishedFilter() }).toArray();
}
