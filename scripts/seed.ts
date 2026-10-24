import { db, ensureIndexes } from '../src/lib/db';
import { productSchema } from '../src/lib/domain';
import { sectionSchema } from '../src/lib/content';

async function main(){
  if(process.env.NODE_ENV==='production'&&!process.argv.includes('--allow-production'))throw new Error('Demo seed is blocked in production.');
  await ensureIndexes();const d=await db();const now=new Date();
  const products=[
    {name:'Signature Circle / Onyx',slug:'signature-circle-onyx',description:'A sculptural everyday bag with a circular silhouette and considered proportions.',shortDescription:'A signature shape for every direction.',categorySlug:'bags',collectionSlugs:['form-study'],tags:['signature','circle','bag'],price:24800,status:'ACTIVE',images:[],variants:[{sku:'PW-CIR-ONYX',color:'Onyx',size:'One Size',inventory:18,reserved:0,enabled:true}]},
    {name:'Signature Circle / Ivory',slug:'signature-circle-ivory',description:'The familiar circle in a soft ivory finish.',shortDescription:'An icon, from every angle.',categorySlug:'bags',collectionSlugs:['form-study'],tags:['signature','circle','bag'],price:24800,status:'ACTIVE',images:[],variants:[{sku:'PW-CIR-IVORY',color:'Ivory',size:'One Size',inventory:12,reserved:0,enabled:true}]},
    {name:'Structure Tee',slug:'structure-tee',description:'A substantial cotton tee cut with architectural ease.',shortDescription:'Everyday form, redrawn.',categorySlug:'clothing',collectionSlugs:['form-study'],tags:['tee','cotton'],price:5800,status:'ACTIVE',images:[],variants:['XS','S','M','L','XL'].flatMap(size=>['Black','Bone'].map(color=>({sku:`PW-TEE-${color.toUpperCase()}-${size}`,color,size,inventory:15,reserved:0,enabled:true})))},
    {name:'Column Earring',slug:'column-earring',description:'A clean vertical line with quiet impact.',shortDescription:'A small statement.',categorySlug:'accessories',collectionSlugs:['form-study'],tags:['jewelry','earrings'],price:4200,status:'ACTIVE',images:[],variants:[{sku:'PW-EAR-SILVER',color:'Silver',size:'One Size',inventory:24,reserved:0,enabled:true}]},
  ];
  for(const raw of products){const data=productSchema.parse(raw);await d.collection('products').updateOne({slug:data.slug},{$setOnInsert:{...data,demo:true,publishedAt:now,createdAt:now,updatedAt:now}},{upsert:true})}
  await d.collection('collections').updateOne({slug:'form-study'},{$setOnInsert:{name:'Form Study',slug:'form-study',description:'An exploration of shape, function and the space between.',status:'LIVE',releaseAt:now,demo:true,createdAt:now}},{upsert:true});
  const sections=[
    {kind:'HERO',heading:'A study in form.',eyebrow:'PARQ WEST / Campaign concept',body:'Clothing, bags and objects shaped by the space between statement and restraint.',cta:'Explore the collection',href:'/shop',imageUrl:'/campaigns/demo-form-study.webp',enabled:true,position:0},
    {kind:'PRODUCT_GRID',heading:'New West',eyebrow:'The edit',body:'',cta:'View all',href:'/new',enabled:true,position:1},
    {kind:'EDITORIAL',heading:'The Signature Circle.',eyebrow:'An icon, from every angle',body:'A signature shape for every direction.',cta:'Discover bags',href:'/bags',enabled:true,position:2},
  ];
  for(const raw of sections){const data=sectionSchema.parse(raw);await d.collection('homepageSections').updateOne({demo:true,position:data.position},{$setOnInsert:{...data,demo:true,createdAt:now,updatedAt:now}},{upsert:true})}
  console.log('Development demo catalog seeded. Products, prices and campaign imagery are fictional.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
