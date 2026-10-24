import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { productSchema, type Product } from '@/lib/domain';
import { db } from '@/lib/db';
import { can, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await requireAdmin('products');const {id}=await params;
  if(!ObjectId.isValid(id))return NextResponse.json({error:'Invalid product'},{status:400});
  try{
    const parsed=productSchema.parse(await request.json());const d=await db();const session=d.client.startSession();
    try{
      await session.withTransaction(async()=>{
        const before=await d.collection<Product>('products').findOne({_id:new ObjectId(id)},{session});
        if(!before)throw new Error('Product not found');
        const data={...parsed,variants:parsed.variants.map(v=>({...v,reserved:before.variants.find(old=>old.sku===v.sku)?.reserved||0}))};
        if(data.variants.some(v=>v.inventory<v.reserved))throw new Error('On-hand stock cannot be less than reserved stock');
        const removedReserved=before.variants.some(v=>v.reserved>0&&!data.variants.some(next=>next.sku===v.sku));
        if(removedReserved)throw new Error('Cannot remove a variant with reserved stock');
        const movements=data.variants.map(v=>({sku:v.sku,delta:v.inventory-(before.variants.find(old=>old.sku===v.sku)?.inventory||0)})).filter(m=>m.delta!==0);
        if(movements.length&&!can(user.role,'inventory'))throw new Error('Inventory permission required');
        await d.collection<Product>('products').updateOne({_id:before._id},{$set:{...data,updatedAt:new Date()}},{session});
        for(const movement of movements)await d.collection('inventoryMovements').insertOne({productId:before._id,sku:movement.sku,delta:movement.delta,reservedDelta:0,reason:'MANUAL_ADJUSTMENT',actorId:user._id,createdAt:new Date()},{session});
        await d.collection('auditLogs').insertOne({actorId:user._id,action:movements.length?'INVENTORY_ADJUSTED':before.price!==data.price?'PRICE_CHANGED':'PRODUCT_UPDATED',entity:'product',entityId:before._id,before,after:data,createdAt:new Date()},{session});
      });
    }finally{await session.endSession()}
    return NextResponse.json({ok:true});
  }catch(error){return NextResponse.json({error:error instanceof z.ZodError?error.issues:error instanceof Error?error.message:'Unable to update product'},{status:400})}
}
