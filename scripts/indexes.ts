import { ensureIndexes } from '../src/lib/db';
ensureIndexes().then(()=>console.log('MongoDB indexes ready')).catch(error=>{console.error(error);process.exitCode=1});
