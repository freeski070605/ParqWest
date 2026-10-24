import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productSchema, checkoutSchema } from '../src/lib/domain';

const product={name:'Structure Tee',slug:'structure-tee',description:'A substantial cotton tee.',categorySlug:'clothing',price:5800,status:'ACTIVE',variants:[{sku:'PW-TEE-BLK-M',color:'Black',size:'M',inventory:10,reserved:2}]};
test('product price uses integer minor units',()=>{assert.equal(productSchema.parse(product).price,5800);assert.equal(productSchema.safeParse({...product,price:58.5}).success,false)});
test('active products require a positive price',()=>{assert.equal(productSchema.safeParse({...product,price:0}).success,false)});
test('a product cannot contain duplicate SKUs',()=>{assert.equal(productSchema.safeParse({...product,variants:[product.variants[0],product.variants[0]]}).success,false)});
test('reserved stock cannot exceed on hand',()=>{assert.equal(productSchema.safeParse({...product,variants:[{...product.variants[0],reserved:11}]}).success,false)});
test('checkout quantities and IDs are bounded',()=>{assert.equal(checkoutSchema.safeParse({lines:[{productId:'not-an-id',sku:'x',quantity:1}]}).success,false);assert.equal(checkoutSchema.safeParse({lines:[{productId:'0123456789abcdef01234567',sku:'x',quantity:11}]}).success,false)});
