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

export type OrderItem = { productId: ObjectId; name: string; slug: string; sku: string; color: string; size: string; unitPrice: number; quantity: number };
export type Order = { _id: ObjectId; number: string; userId?: ObjectId; email: string; items: OrderItem[]; subtotal: number; currency: 'usd'; status: string; stripeSessionId?: string; createdAt: Date; updatedAt: Date; demo?: boolean };

export function publishedFilter(): Filter<Product> {
  return { $or: [
    { status:'ACTIVE', $or:[{publishedAt:{$exists:false}},{publishedAt:{$lte:new Date()}}] },
    { status:'SCHEDULED', publishedAt:{$lte:new Date()} }
  ] };
}
export function money(cents: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
