import { NextResponse } from 'next/server';
import { productSchema, type Product } from '@/lib/domain';
import { db } from '@/lib/db';
import { can, requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
export async function POST(request:Request){
  const user=await requireAdmin('products');
  try{
    const parsed=productSchema.parse(await request.json());
    const data={...parsed,variants:parsed.variants.map(v=>({...v,reserved:0}))};
    if(data.variants.some(v=>v.inventory>0)&&!can(user.role,'inventory'))return NextResponse.json({error:'Inventory permission required'},{status:403});
    const now=new Date();const d=await db();const session=d.client.startSession();const id=new ObjectId();
    try{await session.withTransaction(async()=>{
      await d.collection<Product>('products').insertOne({_id:id,...data,createdAt:now,updatedAt:now},{session});
      for(const variant of data.variants)if(variant.inventory>0)await d.collection('inventoryMovements').insertOne({productId:id,sku:variant.sku,delta:variant.inventory,reservedDelta:0,reason:'INITIAL_STOCK',actorId:user._id,createdAt:now},{session});
      await d.collection('auditLogs').insertOne({actorId:user._id,action:'PRODUCT_CREATED',entity:'product',entityId:id,after:data,createdAt:now},{session});
    })}finally{await session.endSession()}
    return NextResponse.json({id:id.toHexString()},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof z.ZodError?error.issues:error instanceof Error?error.message:'Unable to create product'},{status:400})}
}
