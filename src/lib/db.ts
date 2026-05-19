import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL, {  });
const db = drizzle(sql, { schema });

export { db, sql };
