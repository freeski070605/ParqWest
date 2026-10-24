import { ObjectId } from 'mongodb';
import { randomInt } from 'crypto';
import { db } from './db';
import { checkoutSchema, type Order, type OrderItem, type Product } from './domain';
import { currentUser } from './auth';

export async function reserveOrder(input: unknown) {
  const { lines } = checkoutSchema.parse(input);
  if (new Set(lines.map(l=>l.sku)).size !== lines.length) throw new Error('Duplicate variants in bag');
  const user = await currentUser();
  const d = await db();
  const client = d.client;
  const session = client.startSession();
  const orderId = new ObjectId();
  try {
    await session.withTransaction(async () => {
      const items: OrderItem[] = [];
      for (const line of lines) {
        const productId = new ObjectId(line.productId);
        const product = await d.collection<Product>('products').findOne({ _id: productId, status: 'ACTIVE', 'variants.sku': line.sku }, { session });
        const variant = product?.variants.find(v=>v.sku===line.sku);
        if (!product || !variant || !variant.enabled || variant.inventory-variant.reserved<line.quantity) throw new Error('An item is no longer available.');
        const result = await d.collection<Product>('products').updateOne({ _id:productId, variants: { $elemMatch: { sku:line.sku, enabled:true, inventory:variant.inventory, reserved:variant.reserved } } }, { $inc: { 'variants.$.reserved': line.quantity }, $set: { updatedAt:new Date() } }, { session });
        if (result.modifiedCount !== 1) throw new Error('An item sold out while you were checking out.');
        items.push({ productId, name:product.name, slug:product.slug, sku:variant.sku, color:variant.color, size:variant.size, unitPrice:variant.price??product.price, quantity:line.quantity });
      }
      const order: Omit<Order,'_id'> = { number:`PW-${Date.now().toString(36).toUpperCase()}${randomInt(100,999)}`, userId:user?._id, email:user?.email||'', items, subtotal:items.reduce((n,i)=>n+i.unitPrice*i.quantity,0), currency:'usd', status:'PENDING', createdAt:new Date(), updatedAt:new Date() };
      await d.collection<Order>('orders').insertOne({ _id:orderId,...order },{ session });
    });
    return await d.collection<Order>('orders').findOne({ _id:orderId });
  } finally { await session.endSession(); }
}

export async function releaseOrder(orderId: ObjectId, reason: string) {
  const d=await db();const session=d.client.startSession();
  try{await session.withTransaction(async()=>{const order=await d.collection<Order>('orders').findOneAndUpdate({_id:orderId,status:'PENDING'},{$set:{status:'CANCELLED',updatedAt:new Date()}},{session,returnDocument:'before'});if(!order)return;for(const item of order.items){await d.collection<Product>('products').updateOne({_id:item.productId,'variants.sku':item.sku},{$inc:{'variants.$.reserved':-item.quantity}},{session});await d.collection('inventoryMovements').insertOne({productId:item.productId,sku:item.sku,delta:0,reservedDelta:-item.quantity,reason,orderId,createdAt:new Date()},{session});}})}finally{await session.endSession()}
}

export async function payOrder(orderId:ObjectId,stripeEventId:string,email:string){const d=await db();const session=d.client.startSession();try{await session.withTransaction(async()=>{const prior=await d.collection('webhookEvents').findOne({stripeId:stripeEventId},{session});if(prior)return;const order=await d.collection<Order>('orders').findOneAndUpdate({_id:orderId,status:'PENDING'},{$set:{status:'PAID',email,updatedAt:new Date()}},{session,returnDocument:'before'});if(!order){const existing=await d.collection<Order>('orders').findOne({_id:orderId},{session});if(existing?.status==='PAID')return;throw new Error('Order is not pending')}for(const item of order.items){await d.collection<Product>('products').updateOne({_id:item.productId,'variants.sku':item.sku},{$inc:{'variants.$.inventory':-item.quantity,'variants.$.reserved':-item.quantity}},{session});await d.collection('inventoryMovements').insertOne({productId:item.productId,sku:item.sku,delta:-item.quantity,reservedDelta:-item.quantity,reason:'ORDER_PAID',orderId,createdAt:new Date()},{session});}await d.collection('webhookEvents').insertOne({stripeId:stripeEventId,type:'checkout.session.completed',orderId,createdAt:new Date()},{session});await d.collection('customerEvents').insertOne({userId:order.userId,email,type:'ORDER_PAID',orderId,createdAt:new Date()},{session});})}finally{await session.endSession()}}
