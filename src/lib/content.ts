import { z } from 'zod';
import type { ObjectId } from 'mongodb';
export const sectionSchema=z.object({
  kind:z.enum(['HERO','EDITORIAL','PRODUCT_GRID']),
  heading:z.string().trim().min(2).max(160),
  body:z.string().trim().max(1000).default(''),
  eyebrow:z.string().trim().max(80).default(''),
  cta:z.string().trim().max(80).default(''),
  href:z.string().trim().startsWith('/').optional().or(z.literal('')),
  imageUrl:z.string().trim().refine(value=>!value||value.startsWith('/')||value.startsWith('https://'),{message:'Use a local path or HTTPS URL'}).optional(),
  enabled:z.boolean().default(false),
  position:z.number().int().min(0),
  startsAt:z.coerce.date().optional(),
  endsAt:z.coerce.date().optional(),
}).superRefine((s,ctx)=>{if(s.startsAt&&s.endsAt&&s.endsAt<=s.startsAt)ctx.addIssue({code:'custom',path:['endsAt'],message:'End must be after start'})});
export type HomepageSection=z.infer<typeof sectionSchema>&{_id:ObjectId;createdAt:Date;updatedAt:Date;demo?:boolean};
