import { z } from 'zod';
import type { Filter, ObjectId } from 'mongodb';

export const variantSchema = z.object({
  sku: z.string().trim().min(1), color: z.string().trim().min(1), size: z.string().trim().min(1),
  price: z.number().int().nonnegative().optional(), inventory: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative().default(0), enabled: z.boolean().default(true),
});
export const productSchema = z.object({
  name: z.string().trim().min(2), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1), shortDescription: z.string().trim().default(''),
  categorySlug: z.string().trim().min(1), collectionSlugs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]), price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SCHEDULED', 'ARCHIVED']).default('DRAFT'),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().min(1) })).default([]),
  variants: z.array(variantSchema).min(1), publishedAt: z.coerce.date().optional(),
}).superRefine((product,context)=>{
  const skus=product.variants.map(v=>v.sku.toLowerCase());
  if(new Set(skus).size!==skus.length)context.addIssue({code:'custom',path:['variants'],message:'SKUs must be unique within a product'});
  if(product.variants.some(v=>v.reserved>v.inventory))context.addIssue({code:'custom',path:['variants'],message:'Reserved stock cannot exceed on-hand stock'});
  if(product.status==='ACTIVE'&&product.price<=0)context.addIssue({code:'custom',path:['price'],message:'Active products require a positive price'});
  if(product.status==='SCHEDULED'&&!product.publishedAt)context.addIssue({code:'custom',path:['publishedAt'],message:'Scheduled products require a publication date'});
});
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & { _id: ObjectId; createdAt: Date; updatedAt: Date; demo?: boolean };

export const cartLineSchema = z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i), sku: z.string().min(1), quantity: z.number().int().min(1).max(10) });
export const checkoutSchema = z.object({ lines: z.array(cartLineSchema).min(1).max(30) });

export const returnRequestSchema = z.object({
  orderId: z.string().regex(/^[a-f\d]{24}$/i),
  sku: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(20),
  reason: z.string().trim().min(1).max(80),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(600).default(''),
  parentSlug: z.string().trim().max(80).default(''),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  storefrontVisible: z.boolean().default(true),
  seoTitle: z.string().trim().max(70).default(''),
  seoDescription: z.string().trim().max(160).default(''),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1200).default(''),
  status: z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'ARCHIVED']).default('DRAFT'),
  hero: z.string().trim().max(300).default(''),
  media: z.array(z.object({ url: z.string().url(), alt: z.string().trim().max(120).default('') })).default([]),
  products: z.array(z.string()).default([]),
  releaseAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  seoTitle: z.string().trim().max(70).default(''),
  seoDescription: z.string().trim().max(160).default(''),
  style: z.object({ accent: z.string().trim().default('#1a1a18'), background: z.string().trim().default('#f6f4ef') }).default({ accent: '#1a1a18', background: '#f6f4ef' }),
});

export const addressSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  company: z.string().trim().max(80).default(''),
  line1: z.string().trim().min(1),
  line2: z.string().trim().max(120).default(''),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(2),
  country: z.string().trim().min(2).default('US'),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export const notificationPreferencesSchema = z.object({
  emailMarketing: z.boolean().default(false),
  smsMarketing: z.boolean().default(false),
  restockAlerts: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
});

export type OrderItem = { productId: ObjectId; name: string; slug: string; sku: string; color: string; size: string; unitPrice: number; quantity: number };
export type Order = { _id: ObjectId; number: string; userId?: ObjectId; email: string; items: OrderItem[]; subtotal: number; currency: 'usd'; status: string; stripeSessionId?: string; createdAt: Date; updatedAt: Date; demo?: boolean };

export type Category = z.infer<typeof categorySchema> & { _id: ObjectId; createdAt: Date; updatedAt: Date };
export type CollectionRecord = z.infer<typeof collectionSchema> & { _id: ObjectId; createdAt: Date; updatedAt: Date };
export type Address = z.infer<typeof addressSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export function publishedFilter(): Filter<Product> {
  return { $or: [
    { status:'ACTIVE', $or:[{publishedAt:{$exists:false}},{publishedAt:{$lte:new Date()}}] },
    { status:'SCHEDULED', publishedAt:{$lte:new Date()} }
  ] };
}
export function money(cents: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
